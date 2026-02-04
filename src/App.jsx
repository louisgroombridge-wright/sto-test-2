import {
  AppBar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  MenuItem,
  Select,
  Toolbar,
  Typography,
} from "@mui/material";
import { Description, Visibility } from "@mui/icons-material";
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Sidebar from "./components/Sidebar";
import PatientProfilePage from "./pages/PatientProfilePage";
import SiteProfilePage from "./pages/SiteProfilePage";
import PlaceholderPage from "./pages/PlaceholderPage";
import CountrySelectionPage from "./pages/CountrySelectionPage";
import SiteRecommendationPage from "./pages/SiteRecommendationPage";
import ScenarioHubPage from "./pages/ScenarioHubPage";

const defaultScenarioPath = "patient-profile";

const initialScenarios = [
  {
    id: "s1",
    name: "Scenario Alpha",
    description: "Baseline lung oncology feasibility sweep.",
    status: "Draft",
    createdBy: "Dr. K. Patel",
    createdAt: "2024-02-04",
    updatedAt: "2024-03-14",
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
    description: "EU expansion with accelerated review track.",
    status: "In Review",
    createdBy: "E. Garner",
    createdAt: "2024-02-18",
    updatedAt: "2024-03-18",
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
    description: "Finalized US/APAC mixed-site plan.",
    status: "Locked",
    createdBy: "M. Chen",
    createdAt: "2024-01-22",
    updatedAt: "2024-03-02",
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

const scenarioBasePath = (scenarioId) => `/scenarios/${scenarioId}`;

const ScenarioWorkspace = ({ scenarios, scenarioRoutes, setScenarioRoutes }) => {
  const { scenarioId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [pendingScenarioId, setPendingScenarioId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [disabledNotice, setDisabledNotice] = useState("");

  const activeScenario = useMemo(
    () => scenarios.find((scenario) => scenario.id === scenarioId),
    [scenarios, scenarioId]
  );

  useEffect(() => {
    if (!scenarioId) {
      return;
    }
    setScenarioRoutes((prev) => ({
      ...prev,
      [scenarioId]: location.pathname,
    }));
  }, [location.pathname, scenarioId, setScenarioRoutes]);

  useEffect(() => {
    setUnsavedChanges(false);
    setDisabledNotice("");
  }, [scenarioId]);

  if (!activeScenario) {
    return <Navigate to="/" replace />;
  }

  const basePath = scenarioBasePath(activeScenario.id);

  const optionItems = useMemo(() => {
    const steps = activeScenario.steps;
    const artifacts = activeScenario.artifacts;

    return [
      {
        label: "Patient Profile",
        path: `${basePath}/patient-profile`,
        status: steps.patientProfile,
        enabled: true,
        disabledReason: "",
      },
      {
        label: "Site Profile",
        path: `${basePath}/site-profile`,
        status: steps.siteProfile,
        enabled: steps.patientProfile !== "Incomplete",
        disabledReason: "Complete Patient Profile to unlock Site Profile.",
      },
      {
        label: "Country Selection",
        path: `${basePath}/country-selection`,
        status: steps.countrySelection,
        enabled:
          steps.patientProfile !== "Incomplete" &&
          steps.siteProfile !== "Incomplete",
        disabledReason: "Complete Patient and Site Profiles to continue.",
      },
      {
        label: "Site Recommendation",
        path: `${basePath}/site-recommendation`,
        status: steps.siteRecommendation,
        enabled: artifacts.countriesApproved,
        disabledReason: "Approve countries before recommending sites.",
      },
      {
        label: "Review & Approval",
        path: `${basePath}/review-approval`,
        status: steps.reviewApproval,
        enabled: artifacts.siteRecommendationsReady,
        disabledReason: "Generate site recommendations first.",
      },
    ];
  }, [activeScenario, basePath]);

  const outputItems = useMemo(() => {
    return [
      {
        label: "Option Snapshot",
        path: `${basePath}/option-snapshot`,
        status: "Read-only",
        icon: <Visibility fontSize="small" />,
        enabled: activeScenario.artifacts.reviewStarted,
        disabledReason: "Begin Review & Approval to unlock outputs.",
      },
      {
        label: "Export & Audit",
        path: `${basePath}/export-audit`,
        status: "Read-only",
        icon: <Description fontSize="small" />,
        enabled: activeScenario.artifacts.reviewStarted,
        disabledReason: "Begin Review & Approval to unlock outputs.",
      },
    ];
  }, [activeScenario, basePath]);

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

  const handleScenarioSelect = (nextScenarioId) => {
    if (nextScenarioId === activeScenario.id) {
      return;
    }

    if (unsavedChanges) {
      setPendingScenarioId(nextScenarioId);
      setConfirmOpen(true);
      return;
    }

    const fallbackPath = `${scenarioBasePath(nextScenarioId)}/${defaultScenarioPath}`;
    navigate(scenarioRoutes[nextScenarioId] || fallbackPath);
  };

  const handleConfirmSwitch = () => {
    setConfirmOpen(false);
    if (!pendingScenarioId) {
      return;
    }
    const nextScenarioId = pendingScenarioId;
    setPendingScenarioId(null);
    setUnsavedChanges(false);
    const fallbackPath = `${scenarioBasePath(nextScenarioId)}/${defaultScenarioPath}`;
    navigate(scenarioRoutes[nextScenarioId] || fallbackPath);
  };

  const handleCancelSwitch = () => {
    setConfirmOpen(false);
    setPendingScenarioId(null);
  };

  const handleNavigate = (path) => {
    setDisabledNotice("");
    if (path.startsWith("/")) {
      navigate(path);
      return;
    }
    navigate(`${basePath}/${path}`);
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
        navSections={navSections}
        activePath={location.pathname}
        onNavigate={handleNavigate}
        onDisabledNavigate={handleDisabledNavigate}
      />
      <Box component="main" sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <AppBar position="sticky" color="inherit" elevation={0}>
          {/* Scenario-first navigation keeps context in the app bar, not inside the workspace body. */}
          <Toolbar sx={{ gap: 2, flexWrap: "wrap" }}>
            <Box>
              <Typography variant="overline" color="text.secondary">
                Active Scenario
              </Typography>
              <Typography variant="h6">{activeScenario.name}</Typography>
            </Box>
            <Chip label={activeScenario.status} size="small" variant="outlined" />
            <Divider flexItem orientation="vertical" sx={{ mx: 1 }} />
            <Box sx={{ minWidth: 220 }}>
              <Select
                size="small"
                value={activeScenario.id}
                onChange={(event) => handleScenarioSelect(event.target.value)}
                fullWidth
              >
                {scenarios.map((scenario) => (
                  <MenuItem key={scenario.id} value={scenario.id}>
                    {scenario.name}
                  </MenuItem>
                ))}
              </Select>
              <Typography variant="caption" color="text.secondary">
                Switch scenario (state auto-saved).
              </Typography>
            </Box>
            <Box sx={{ ml: "auto" }}>
              <Button variant="text" onClick={() => navigate("/")}>Back to Scenarios</Button>
            </Box>
          </Toolbar>
        </AppBar>
        <Box sx={{ flexGrow: 1 }}>
          <Routes>
            <Route index element={<Navigate to={defaultScenarioPath} replace />} />
            <Route path="patient-profile" element={<PatientProfilePage />} />
            <Route path="site-profile" element={<SiteProfilePage />} />
            <Route path="country-selection" element={<CountrySelectionPage />} />
            <Route path="site-recommendation" element={<SiteRecommendationPage />} />
            <Route
              path="site-recommendation/shared"
              element={<SiteRecommendationPage sharedView />}
            />
            <Route
              path="review-approval"
              element={
                <PlaceholderPage
                  title="Review & Approval"
                  description="Finalize the scenario and capture sign-off decisions."
                  {...pageProps}
                />
              }
            />
            <Route
              path="option-snapshot"
              element={
                <PlaceholderPage
                  title="Option Snapshot"
                  description="Read-only summary of the active scenario outcomes."
                  {...pageProps}
                />
              }
            />
            <Route
              path="export-audit"
              element={
                <PlaceholderPage
                  title="Export & Audit"
                  description="Download audit logs and export-ready scenario packages."
                  {...pageProps}
                />
              }
            />
            <Route
              path="ai-assist"
              element={
                <PlaceholderPage
                  title="AI Assist"
                  description="Access AI-guided recommendations without altering scenario state."
                  {...pageProps}
                />
              }
            />
            <Route
              path="settings"
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

const App = () => {
  const [scenarios, setScenarios] = useState(initialScenarios);
  const [scenarioRoutes, setScenarioRoutes] = useState({
    [initialScenarios[0].id]: `${scenarioBasePath(initialScenarios[0].id)}/${defaultScenarioPath}`,
  });
  const navigate = useNavigate();

  const handleCreateScenario = ({ name, description }) => {
    const newScenario = {
      id: `s-${Math.random().toString(36).slice(2, 8)}`,
      name,
      description,
      status: "Draft",
      createdBy: "You",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      steps: {
        patientProfile: "Incomplete",
        siteProfile: "Incomplete",
        countrySelection: "Incomplete",
        siteRecommendation: "Incomplete",
        reviewApproval: "Incomplete",
      },
      artifacts: {
        countriesApproved: false,
        siteRecommendationsReady: false,
        reviewStarted: false,
      },
    };
    setScenarios((prev) => [newScenario, ...prev]);
    const targetPath = `${scenarioBasePath(newScenario.id)}/${defaultScenarioPath}`;
    setScenarioRoutes((prev) => ({
      ...prev,
      [newScenario.id]: targetPath,
    }));
    navigate(targetPath);
  };

  const handleOpenScenario = (scenarioId) => {
    const fallbackPath = `${scenarioBasePath(scenarioId)}/${defaultScenarioPath}`;
    navigate(scenarioRoutes[scenarioId] || fallbackPath);
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <ScenarioHubPage
            scenarios={scenarios}
            onCreateScenario={handleCreateScenario}
            onOpenScenario={handleOpenScenario}
          />
        }
      />
      <Route
        path="/scenarios/:scenarioId/*"
        element={
          <ScenarioWorkspace
            scenarios={scenarios}
            scenarioRoutes={scenarioRoutes}
            setScenarioRoutes={setScenarioRoutes}
          />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
