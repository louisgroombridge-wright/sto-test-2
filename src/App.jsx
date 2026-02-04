import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";
import { Description, Visibility } from "@mui/icons-material";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Sidebar from "./components/Sidebar";
import PatientProfilePage from "./pages/PatientProfilePage";
import SiteProfilePage from "./pages/SiteProfilePage";
import PlaceholderPage from "./pages/PlaceholderPage";
import CountrySelectionPage from "./pages/CountrySelectionPage";
import SiteRecommendationPage from "./pages/SiteRecommendationPage";

const defaultPath = "/patient-profile";

const scenarios = [
  {
    id: "s1",
    name: "Scenario Alpha",
    status: "Draft",
    steps: {
      patientProfile: "Complete",
      siteProfile: "In Progress",
      countrySelection: "Incomplete",
      siteRecommendation: "Incomplete",
      reviewApproval: "Incomplete",
    },
    artifacts: {
      countriesApproved: false,
      siteRecommendationsReady: false,
      reviewStarted: false,
    },
  },
  {
    id: "s2",
    name: "Scenario Beta",
    status: "Reviewed",
    steps: {
      patientProfile: "Complete",
      siteProfile: "Complete",
      countrySelection: "Complete",
      siteRecommendation: "In Progress",
      reviewApproval: "Incomplete",
    },
    artifacts: {
      countriesApproved: true,
      siteRecommendationsReady: false,
      reviewStarted: false,
    },
  },
  {
    id: "s3",
    name: "Scenario Gamma",
    status: "Approved",
    steps: {
      patientProfile: "Complete",
      siteProfile: "Complete",
      countrySelection: "Complete",
      siteRecommendation: "Complete",
      reviewApproval: "Complete",
    },
    artifacts: {
      countriesApproved: true,
      siteRecommendationsReady: true,
      reviewStarted: true,
    },
  },
];

const App = () => {
  const [activeScenarioId, setActiveScenarioId] = useState(scenarios[0].id);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [pendingScenarioId, setPendingScenarioId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [disabledNotice, setDisabledNotice] = useState("");
  const [scenarioRoutes, setScenarioRoutes] = useState({
    [scenarios[0].id]: defaultPath,
  });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setScenarioRoutes((prev) => ({
      ...prev,
      [activeScenarioId]: location.pathname,
    }));
  }, [activeScenarioId, location.pathname]);

  useEffect(() => {
    if (location.pathname === "/") {
      navigate(defaultPath, { replace: true });
    }
  }, [location.pathname, navigate]);

  const activeScenario = useMemo(
    () => scenarios.find((scenario) => scenario.id === activeScenarioId),
    [activeScenarioId]
  );

  const optionItems = useMemo(() => {
    const steps = activeScenario.steps;
    const artifacts = activeScenario.artifacts;

    return [
      {
        label: "Patient Profile",
        path: "/patient-profile",
        status: steps.patientProfile,
        enabled: true,
        disabledReason: "",
      },
      {
        label: "Site Profile",
        path: "/site-profile",
        status: steps.siteProfile,
        enabled: steps.patientProfile !== "Incomplete",
        disabledReason: "Complete Patient Profile to unlock Site Profile.",
      },
      {
        label: "Country Selection",
        path: "/country-selection",
        status: steps.countrySelection,
        enabled:
          steps.patientProfile !== "Incomplete" &&
          steps.siteProfile !== "Incomplete",
        disabledReason: "Complete Patient and Site Profiles to continue.",
      },
      {
        label: "Site Recommendation",
        path: "/site-recommendation",
        status: steps.siteRecommendation,
        enabled: artifacts.countriesApproved,
        disabledReason: "Approve countries before recommending sites.",
      },
      {
        label: "Review & Approval",
        path: "/review-approval",
        status: steps.reviewApproval,
        enabled: artifacts.siteRecommendationsReady,
        disabledReason: "Generate site recommendations first.",
      },
    ];
  }, [activeScenario]);

  const outputItems = useMemo(() => {
    return [
      {
        label: "Option Snapshot",
        path: "/option-snapshot",
        status: "Read-only",
        icon: <Visibility fontSize="small" />,
        enabled: activeScenario.artifacts.reviewStarted,
        disabledReason: "Begin Review & Approval to unlock outputs.",
      },
      {
        label: "Export & Audit",
        path: "/export-audit",
        status: "Read-only",
        icon: <Description fontSize="small" />,
        enabled: activeScenario.artifacts.reviewStarted,
        disabledReason: "Begin Review & Approval to unlock outputs.",
      },
    ];
  }, [activeScenario]);

  const navSections = [
    {
      label: "Option Builder",
      items: optionItems.map((item) => ({
        ...item,
        icon: "status",
      })),
    },
    {
      label: "Outputs",
      items: outputItems,
    },
  ];

  const handleScenarioSelect = (scenarioId) => {
    if (scenarioId === activeScenarioId) {
      return;
    }

    if (unsavedChanges) {
      setPendingScenarioId(scenarioId);
      setConfirmOpen(true);
      return;
    }

    setActiveScenarioId(scenarioId);
    setUnsavedChanges(false);
    navigate(scenarioRoutes[scenarioId] || defaultPath);
  };

  const handleConfirmSwitch = () => {
    setConfirmOpen(false);
    if (!pendingScenarioId) {
      return;
    }
    const nextScenarioId = pendingScenarioId;
    setPendingScenarioId(null);
    setActiveScenarioId(nextScenarioId);
    setUnsavedChanges(false);
    navigate(scenarioRoutes[nextScenarioId] || defaultPath);
  };

  const handleCancelSwitch = () => {
    setConfirmOpen(false);
    setPendingScenarioId(null);
  };

  const handleNavigate = (path) => {
    setDisabledNotice("");
    navigate(path);
  };

  const handleDisabledNavigate = () => {
    setDisabledNotice("Complete the previous step to continue.");
  };

  const pageProps = {
    unsavedChanges,
    onToggleUnsaved: () => setUnsavedChanges((prev) => !prev),
    notice: disabledNotice,
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", background: "#f7f8fb" }}>
      <Sidebar
        scenarios={scenarios}
        activeScenarioId={activeScenarioId}
        onScenarioSelect={handleScenarioSelect}
        navSections={navSections}
        activePath={location.pathname}
        onNavigate={handleNavigate}
        onDisabledNavigate={handleDisabledNavigate}
      />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Routes>
          <Route
            path="/patient-profile"
            element={
              <PatientProfilePage />
            }
          />
          <Route
            path="/site-profile"
            element={
              <SiteProfilePage />
            }
          />
          <Route
            path="/country-selection"
            element={
              <CountrySelectionPage />
            }
          />
          <Route
            path="/site-recommendation"
            element={
              <SiteRecommendationPage />
            }
          />
          <Route
            path="/site-recommendation/shared"
            element={
              <SiteRecommendationPage sharedView />
            }
          />
          <Route
            path="/review-approval"
            element={
              <PlaceholderPage
                title="Review & Approval"
                description="Finalize the scenario and capture sign-off decisions."
                {...pageProps}
              />
            }
          />
          <Route
            path="/option-snapshot"
            element={
              <PlaceholderPage
                title="Option Snapshot"
                description="Read-only summary of the active scenario outcomes."
                {...pageProps}
              />
            }
          />
          <Route
            path="/export-audit"
            element={
              <PlaceholderPage
                title="Export & Audit"
                description="Download audit logs and export-ready scenario packages."
                {...pageProps}
              />
            }
          />
          <Route
            path="/ai-assist"
            element={
              <PlaceholderPage
                title="AI Assist"
                description="Access AI-guided recommendations without altering scenario state."
                {...pageProps}
              />
            }
          />
          <Route
            path="/settings"
            element={
              <PlaceholderPage
                title="Settings"
                description="Adjust user preferences and workflow options."
                {...pageProps}
              />
            }
          />
          <Route
            path="*"
            element={
              <PlaceholderPage
                title="Patient Profile"
                description="Define target patient cohorts, inclusion criteria, and baseline assumptions."
                {...pageProps}
              />
            }
          />
        </Routes>
      </Box>
      <Dialog open={confirmOpen} onClose={handleCancelSwitch}>
        <DialogTitle>Unsaved changes</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You have unsaved changes in this scenario. Switch scenarios anyway?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelSwitch}>Stay</Button>
          <Button variant="contained" onClick={handleConfirmSwitch}>
            Switch Scenario
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default App;
