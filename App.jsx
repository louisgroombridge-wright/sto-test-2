import React, { useMemo, useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Switch,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  Typography,
  Checkbox,
  Stack,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const drawerWidth = 260;
const steps = [
  "Patient Population Sampling",
  "Country Feasibility Narrowing",
  "Site Eligibility Definition",
  "Automated Site Shortlisting",
  "Feasibility Outreach Package",
];

const mockProfiles = () => [
  {
    id: "pp-1",
    name: "High-risk breast oncology",
    condition: "HER2+ breast cancer",
    inclusion: "Stage II-III, biomarker positive",
    exclusion: "Cardiac comorbidities",
    eligiblePatients: 1240,
    excludedPercent: 22,
    drivers: ["Biomarker prevalence", "Screening velocity"],
    status: "Draft",
  },
  {
    id: "pp-2",
    name: "Metastatic lung",
    condition: "NSCLC EGFR",
    inclusion: "Progressed on 1L therapy",
    exclusion: "Brain mets uncontrolled",
    eligiblePatients: 980,
    excludedPercent: 31,
    drivers: ["Mutation prevalence", "Prior therapy lines"],
    status: "Draft",
  },
  {
    id: "pp-3",
    name: "Relapsed lymphoma",
    condition: "DLBCL",
    inclusion: "Relapse within 12 months",
    exclusion: "Prior CAR-T",
    eligiblePatients: 620,
    excludedPercent: 18,
    drivers: ["Referral networks", "Hospital catchment"],
    status: "Draft",
  },
];

const mockCountrySets = () => [
  {
    id: "set-1",
    name: "Baseline",
    countries: [
      { id: "US", name: "United States", region: "North America", flag: "Required" },
      { id: "DE", name: "Germany", region: "Europe", flag: "Optional" },
      { id: "BR", name: "Brazil", region: "LATAM", flag: "Optional" },
      { id: "IN", name: "India", region: "APAC", flag: "Excluded" },
    ],
  },
];

const mockSites = () => [
  {
    id: "site-1",
    name: "Northlake Medical Center",
    city: "Chicago",
    country: "United States",
    match: "Pass",
    missing: "",
    experience: "HER2 trials (3), oncology CRC team",
    notes: "Strong referral network",
    include: true,
  },
  {
    id: "site-2",
    name: "Kaiser Oncology West",
    city: "Berlin",
    country: "Germany",
    match: "Partial",
    missing: "Biomarker lab",
    experience: "NSCLC trials (2)",
    notes: "Needs lab partner",
    include: true,
  },
  {
    id: "site-3",
    name: "Sao Paulo Research",
    city: "Sao Paulo",
    country: "Brazil",
    match: "Fail",
    missing: "PI availability",
    experience: "Lymphoma registry",
    notes: "Limited staffing",
    include: false,
  },
];

const mockOutreach = () => [
  {
    id: "out-1",
    site: "Northlake Medical Center",
    country: "United States",
    status: "Not contacted",
    owner: "L. Chen",
    notes: "Send protocol synopsis",
    nextAction: "2024-10-12",
  },
  {
    id: "out-2",
    site: "Kaiser Oncology West",
    country: "Germany",
    status: "Sent",
    owner: "M. Patel",
    notes: "Waiting for feasibility form",
    nextAction: "2024-10-18",
  },
];

const viabilityChip = (status) => {
  const colorMap = {
    Viable: "success",
    Risky: "warning",
    "No-go": "error",
    Unknown: "default",
  };
  return <Chip label={status} color={colorMap[status] || "default"} size="small" />;
};

const matchChip = (status) => {
  const colorMap = {
    Pass: "success",
    Partial: "warning",
    Fail: "error",
  };
  return <Chip label={status} color={colorMap[status] || "default"} size="small" />;
};

const EvidenceDrawer = ({ open, onClose, contextTitle, onRecompute }) => {
  const [tab, setTab] = useState(0);
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: 380, p: 2 } }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="h6">Evidence & Assumptions</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        {contextTitle || "Explainable output"}
      </Typography>
      <Tabs value={tab} onChange={(event, value) => setTab(value)} sx={{ mt: 2 }}>
        <Tab label="Evidence" />
        <Tab label="Assumptions" />
        <Tab label="Overrides" />
      </Tabs>
      {tab === 0 && (
        <Box sx={{ mt: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Study</TableCell>
                <TableCell>Relevance</TableCell>
                <TableCell align="right">Boost</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                { id: 1, name: "Onco Registry 2023", score: 0.82 },
                { id: 2, name: "Real-world Screen 2022", score: 0.71 },
              ].map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.score}</TableCell>
                  <TableCell align="right">
                    <FormControlLabel control={<Switch />} label="Boost" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
      {tab === 1 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2">Assumptions</Typography>
          <ul>
            <li>Assumes 8% screening drop-off for biomarker testing.</li>
            <li>Uses 12-month historical referral velocity.</li>
            <li>Missing data inferred from regional peers.</li>
          </ul>
        </Box>
      )}
      {tab === 2 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2">User overrides</Typography>
          <Typography variant="body2" color="text.secondary">
            No overrides applied yet.
          </Typography>
          <Button variant="contained" sx={{ mt: 2 }} onClick={onRecompute}>
            Recompute
          </Button>
        </Box>
      )}
    </Drawer>
  );
};

const ConfirmDialog = ({ open, title, description, onCancel, onConfirm }) => (
  <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel}>Cancel</Button>
      <Button color="error" variant="contained" onClick={onConfirm}>
        Confirm
      </Button>
    </DialogActions>
  </Dialog>
);

const StepperNav = ({ activeStep }) => (
  <Box sx={{ width: "100%" }}>
    <Typography variant="subtitle2" sx={{ mb: 1 }}>
      Workflow steps
    </Typography>
    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
      {steps.map((label, index) => (
        <Chip
          key={label}
          label={`${index + 1}. ${label}`}
          color={index === activeStep ? "primary" : "default"}
          variant={index === activeStep ? "filled" : "outlined"}
        />
      ))}
    </Stack>
  </Box>
);

const AppShell = ({ children, activeStep, onStepChange }) => (
  <Box sx={{ display: "flex" }}>
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar sx={{ alignItems: "flex-start", gap: 2, py: 2 }}>
        <Typography variant="h6" sx={{ minWidth: 220 }}>
          Feasibility Flow
        </Typography>
        <StepperNav activeStep={activeStep} />
      </Toolbar>
    </AppBar>
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: "border-box" },
      }}
    >
      <Toolbar />
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
          Workflow
        </Typography>
        {steps.map((step, index) => (
          <Button
            key={step}
            fullWidth
            variant={activeStep === index ? "contained" : "text"}
            sx={{ justifyContent: "flex-start", mb: 1 }}
            onClick={() => onStepChange(index)}
          >
            {step}
          </Button>
        ))}
      </Box>
    </Drawer>
    <Box component="main" sx={{ flexGrow: 1, p: 3, ml: `${drawerWidth}px` }}>
      <Toolbar />
      {children}
    </Box>
  </Box>
);

const PatientProfilesStep = ({
  patientProfiles,
  selectedProfiles,
  onGenerate,
  onSelectProfile,
  onOpenEvidence,
  onUpdateProfile,
  onDuplicateProfile,
  onDiscardProfile,
}) => {
  const [search, setSearch] = useState("");
  const [editProfile, setEditProfile] = useState(null);
  const filteredProfiles = patientProfiles.filter((profile) =>
    profile.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Patient Population Sampling
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Draft patient populations and keep 2–4 candidate profiles to seed country feasibility tests.
      </Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Button variant="contained" onClick={onGenerate}>
            Generate candidates
          </Button>
          <Button variant="outlined" startIcon={<AddIcon />}>
            Add manual
          </Button>
          <TextField
            size="small"
            label="Search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Chip
            label={`Kept: ${selectedProfiles.length}`}
            color={selectedProfiles.length < 2 || selectedProfiles.length > 4 ? "warning" : "success"}
          />
        </Stack>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" />
              <TableCell>Name</TableCell>
              <TableCell>Condition</TableCell>
              <TableCell>Key Inclusion</TableCell>
              <TableCell>Key Exclusion</TableCell>
              <TableCell>Eligible Patients</TableCell>
              <TableCell>% Excluded</TableCell>
              <TableCell>Drivers</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProfiles.map((profile) => (
              <TableRow key={profile.id} hover>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedProfiles.includes(profile.id)}
                    onChange={() => onSelectProfile(profile.id)}
                  />
                </TableCell>
                <TableCell>{profile.name}</TableCell>
                <TableCell>{profile.condition}</TableCell>
                <TableCell>{profile.inclusion}</TableCell>
                <TableCell>{profile.exclusion}</TableCell>
                <TableCell>{profile.eligiblePatients}</TableCell>
                <TableCell>{profile.excludedPercent}%</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    {profile.drivers.map((driver) => (
                      <Chip key={driver} label={driver} size="small" />
                    ))}
                  </Stack>
                </TableCell>
                <TableCell>{profile.status}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Tooltip title="Edit">
                      <IconButton onClick={() => setEditProfile(profile)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Duplicate">
                      <IconButton onClick={() => onDuplicateProfile(profile)}>
                        <ContentCopyIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Discard">
                      <IconButton onClick={() => onDiscardProfile(profile)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                    <Button size="small" onClick={() => onOpenEvidence(profile.name)}>
                      Evidence
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {(selectedProfiles.length < 2 || selectedProfiles.length > 4) && (
          <Typography variant="body2" color="warning.main" sx={{ mt: 2 }}>
            Keep 2–4 profiles to proceed to country feasibility tests.
          </Typography>
        )}
      </Paper>
      <Dialog open={Boolean(editProfile)} onClose={() => setEditProfile(null)} fullWidth maxWidth="sm">
        <DialogTitle>Edit patient profile</DialogTitle>
        <DialogContent sx={{ display: "grid", gap: 2, mt: 1 }}>
          <TextField
            label="Name"
            value={editProfile?.name || ""}
            onChange={(event) =>
              setEditProfile((prev) => ({ ...prev, name: event.target.value }))
            }
          />
          <TextField
            label="Key inclusion"
            value={editProfile?.inclusion || ""}
            onChange={(event) =>
              setEditProfile((prev) => ({ ...prev, inclusion: event.target.value }))
            }
          />
          <TextField
            label="Key exclusion"
            value={editProfile?.exclusion || ""}
            onChange={(event) =>
              setEditProfile((prev) => ({ ...prev, exclusion: event.target.value }))
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditProfile(null)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              onUpdateProfile(editProfile);
              setEditProfile(null);
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const CountryFeasibilityStep = ({
  selectedProfiles,
  patientProfiles,
  countrySets,
  selectedCountrySetId,
  onSelectCountrySet,
  onDuplicateCountrySet,
  onUpdateCountryFlag,
  onRunTests,
  onOpenEvidence,
  onExport,
}) => {
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("All");
  const activeSet = countrySets.find((set) => set.id === selectedCountrySetId);
  const selectedProfileObjects = patientProfiles.filter((profile) =>
    selectedProfiles.includes(profile.id)
  );

  if (selectedProfiles.length < 2 || selectedProfiles.length > 4) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Country Feasibility Narrowing
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Select 2–4 patient profiles to unlock country feasibility tests.
        </Typography>
      </Paper>
    );
  }

  const filteredCountries = activeSet.countries.filter((country) => {
    const matchesSearch = country.name.toLowerCase().includes(search.toLowerCase());
    const matchesRegion = region === "All" || country.region === region;
    return matchesSearch && matchesRegion;
  });

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Country Feasibility Narrowing
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Run profile-by-country feasibility tests, then label required, optional, or excluded countries.
      </Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Button variant="contained" onClick={onRunTests}>
            Run country tests
          </Button>
          <Button variant="outlined" onClick={onExport}>
            Export CSV
          </Button>
          <TextField
            size="small"
            label="Search countries"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Region</InputLabel>
            <Select value={region} label="Region" onChange={(event) => setRegion(event.target.value)}>
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="North America">North America</MenuItem>
              <MenuItem value="Europe">Europe</MenuItem>
              <MenuItem value="LATAM">LATAM</MenuItem>
              <MenuItem value="APAC">APAC</MenuItem>
            </Select>
          </FormControl>
          <Button variant="text" onClick={onDuplicateCountrySet}>
            Duplicate set
          </Button>
        </Stack>
        <Tabs value={selectedCountrySetId} onChange={(event, value) => onSelectCountrySet(value)}>
          {countrySets.map((set) => (
            <Tab key={set.id} value={set.id} label={set.name} />
          ))}
        </Tabs>
        <Divider sx={{ my: 2 }} />
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Country</TableCell>
              {selectedProfileObjects.map((profile) => (
                <TableCell key={profile.id}>{profile.name}</TableCell>
              ))}
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCountries.map((country) => (
              <TableRow key={country.id} hover>
                <TableCell>{country.name}</TableCell>
                {selectedProfileObjects.map((profile) => (
                  <TableCell key={`${country.id}-${profile.id}`}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body2">{Math.floor(Math.random() * 800 + 200)}</Typography>
                      {viabilityChip(["Viable", "Risky", "No-go", "Unknown"][
                        Math.floor(Math.random() * 4)
                      ])}
                      <Button size="small" onClick={() => onOpenEvidence(`${country.name} / ${profile.name}`)}>
                        Evidence
                      </Button>
                    </Stack>
                  </TableCell>
                ))}
                <TableCell>{country.flag}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    {"Required,Optional,Excluded".split(",").map((flag) => (
                      <Button
                        key={flag}
                        size="small"
                        variant={country.flag === flag ? "contained" : "outlined"}
                        onClick={() => onUpdateCountryFlag(country.id, flag)}
                      >
                        {flag}
                      </Button>
                    ))}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

const SiteEligibilityStep = ({
  siteEligibilityRules,
  onToggleRule,
  onApplyGate,
  onReset,
  onSaveTemplate,
  includeUnknowns,
  onToggleUnknowns,
  onOpenEvidence,
}) => (
  <Box>
    <Typography variant="h5" gutterBottom>
      Site Eligibility Definition
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
      Build a checklist gate based on equipment, experience, and operations readiness.
    </Typography>
    <Paper sx={{ p: 2, mb: 2 }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Button variant="contained" onClick={onApplyGate}>
          Apply gate to sites
        </Button>
        <Button variant="outlined" onClick={onReset}>
          Reset
        </Button>
        <Button variant="text" onClick={onSaveTemplate}>
          Save as template
        </Button>
        <FormControlLabel
          control={<Switch checked={includeUnknowns} onChange={onToggleUnknowns} />}
          label="Include unknowns"
        />
        <Button size="small" onClick={() => onOpenEvidence("Eligibility rules")}>Evidence</Button>
      </Stack>
      {Object.entries(siteEligibilityRules).map(([section, rules]) => (
        <Box key={section} sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            {section}
          </Typography>
          <Stack spacing={1}>
            {rules.map((rule) => (
              <Paper key={rule.id} variant="outlined" sx={{ p: 1.5 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Checkbox checked={rule.enabled} onChange={() => onToggleRule(section, rule.id)} />
                  <Typography sx={{ flex: 1 }}>{rule.label}</Typography>
                  <Chip label={`${rule.impact} sites remaining`} size="small" />
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Box>
      ))}
    </Paper>
  </Box>
);

const SiteShortlistStep = ({
  siteShortlist,
  onToggleInclude,
  onBulkAction,
  selectedSiteIds,
  onToggleSelect,
  onOpenEvidence,
  onExport,
}) => {
  const selectedSite = siteShortlist.find((site) => site.id === selectedSiteIds[0]);
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Automated Site Shortlisting
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Review the ranked site list, inspect evidence, and override include/exclude decisions.
      </Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Button variant="outlined" onClick={() => onBulkAction("include")}>
            Include selected
          </Button>
          <Button variant="outlined" onClick={() => onBulkAction("exclude")}>
            Exclude selected
          </Button>
          <Button variant="outlined" onClick={() => onBulkAction("flag")}>
            Flag for review
          </Button>
          <Button variant="text" onClick={onExport}>
            Export shortlist CSV
          </Button>
        </Stack>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" />
              <TableCell>Site</TableCell>
              <TableCell>City</TableCell>
              <TableCell>Country</TableCell>
              <TableCell>Match</TableCell>
              <TableCell>Missing Requirements</TableCell>
              <TableCell>Relevant Experience</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell>Evidence</TableCell>
              <TableCell>Include</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {siteShortlist.map((site) => (
              <TableRow key={site.id} hover>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedSiteIds.includes(site.id)}
                    onChange={() => onToggleSelect(site.id)}
                  />
                </TableCell>
                <TableCell>{site.name}</TableCell>
                <TableCell>{site.city}</TableCell>
                <TableCell>{site.country}</TableCell>
                <TableCell>{matchChip(site.match)}</TableCell>
                <TableCell>{site.missing || "None"}</TableCell>
                <TableCell>{site.experience}</TableCell>
                <TableCell>{site.notes}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => onOpenEvidence(site.name)}>
                    Evidence
                  </Button>
                </TableCell>
                <TableCell>
                  <Switch checked={site.include} onChange={() => onToggleInclude(site.id)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Why this site?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" color="text.secondary">
            {selectedSite
              ? `${selectedSite.name} ranks highly due to matching equipment and prior trial experience. Missing: ${
                  selectedSite.missing || "None"
                }.`
              : "Select a site to inspect the decision rationale."}
          </Typography>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

const OutreachPackageStep = ({ outreachList, onPrepare, onExport }) => (
  <Box>
    <Typography variant="h5" gutterBottom>
      Feasibility Outreach Package
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
      Prepare outreach-ready contact lists and a templated message draft.
    </Typography>
    <Paper sx={{ p: 2, mb: 2 }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Button variant="contained" onClick={onPrepare}>
          Prepare outreach package
        </Button>
        <Button variant="outlined" onClick={onExport}>
          Export CSV
        </Button>
      </Stack>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Site</TableCell>
            <TableCell>Country</TableCell>
            <TableCell>Contact status</TableCell>
            <TableCell>Owner</TableCell>
            <TableCell>Notes</TableCell>
            <TableCell>Next action date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {outreachList.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.site}</TableCell>
              <TableCell>{item.country}</TableCell>
              <TableCell>
                <Chip label={item.status} variant="outlined" size="small" />
              </TableCell>
              <TableCell>{item.owner}</TableCell>
              <TableCell>{item.notes}</TableCell>
              <TableCell>{item.nextAction}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle2">Template message preview</Typography>
      <Paper variant="outlined" sx={{ p: 2, mt: 1, backgroundColor: "#fafafa" }}>
        <Typography variant="body2">
          Hello [Site Lead], we are conducting a feasibility assessment for a HER2+ breast cancer trial.
          Your site was shortlisted based on biomarker testing capabilities and prior oncology trial
          experience. Please find the synopsis attached and confirm interest by [date].
        </Typography>
      </Paper>
    </Paper>
  </Box>
);

export default function App() {
  const [activeStep, setActiveStep] = useState(0);
  const [patientProfiles, setPatientProfiles] = useState(mockProfiles());
  const [selectedProfiles, setSelectedProfiles] = useState(["pp-1", "pp-2"]);
  const [countrySets, setCountrySets] = useState(mockCountrySets());
  const [selectedCountrySetId, setSelectedCountrySetId] = useState("set-1");
  const [siteEligibilityRules, setSiteEligibilityRules] = useState({
    Equipment: [
      { id: "equip-1", label: "MRI capability", impact: 128, enabled: true },
      { id: "equip-2", label: "PET-CT on site", impact: 94, enabled: false },
      { id: "equip-3", label: "On-site lab", impact: 76, enabled: true },
      { id: "equip-4", label: "Infusion chairs (4+)", impact: 52, enabled: true },
    ],
    Experience: [
      { id: "exp-1", label: "Oncology trials in last 24 months", impact: 88, enabled: true },
      { id: "exp-2", label: "Indication tags: breast / lung", impact: 63, enabled: false },
      { id: "exp-3", label: "Biomarker testing history", impact: 44, enabled: true },
    ],
    Ops: [
      { id: "ops-1", label: "CRC count 2-5", impact: 71, enabled: true },
      { id: "ops-2", label: "PI availability 0.3 FTE", impact: 38, enabled: false },
    ],
  });
  const [includeUnknowns, setIncludeUnknowns] = useState(true);
  const [siteShortlist, setSiteShortlist] = useState(mockSites());
  const [outreachList, setOutreachList] = useState(mockOutreach());
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [evidenceContext, setEvidenceContext] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, target: null });
  const [selectedSiteIds, setSelectedSiteIds] = useState([]);

  const handleSnackbar = (message) => setSnackbar({ open: true, message });

  const handleGenerateProfiles = () => {
    setPatientProfiles(mockProfiles());
    handleSnackbar("Generated candidate profiles.");
  };

  const handleSelectProfile = (profileId) => {
    setSelectedProfiles((prev) =>
      prev.includes(profileId) ? prev.filter((id) => id !== profileId) : [...prev, profileId]
    );
  };

  const handleUpdateProfile = (profile) => {
    setPatientProfiles((prev) => prev.map((item) => (item.id === profile.id ? profile : item)));
    handleSnackbar("Profile updated.");
  };

  const handleDuplicateProfile = (profile) => {
    const copy = { ...profile, id: `${profile.id}-copy`, name: `${profile.name} (copy)` };
    setPatientProfiles((prev) => [...prev, copy]);
    handleSnackbar("Profile duplicated.");
  };

  const handleDiscardProfile = (profile) => {
    setConfirmDialog({ open: true, target: profile });
  };

  const confirmDiscardProfile = () => {
    setPatientProfiles((prev) => prev.filter((item) => item.id !== confirmDialog.target.id));
    setSelectedProfiles((prev) => prev.filter((id) => id !== confirmDialog.target.id));
    setConfirmDialog({ open: false, target: null });
    handleSnackbar("Profile discarded.");
  };

  const handleOpenEvidence = (context) => {
    setEvidenceContext(context);
    setEvidenceOpen(true);
  };

  const handleRecompute = () => {
    handleSnackbar("Recomputed with overrides.");
  };

  const handleDuplicateCountrySet = () => {
    const base = countrySets.find((set) => set.id === selectedCountrySetId);
    const newSet = {
      ...base,
      id: `set-${countrySets.length + 1}`,
      name: `${base.name} copy`,
      countries: base.countries.map((country) => ({ ...country })),
    };
    setCountrySets((prev) => [...prev, newSet]);
    setSelectedCountrySetId(newSet.id);
    handleSnackbar("Country set duplicated.");
  };

  const handleUpdateCountryFlag = (countryId, flag) => {
    setCountrySets((prev) =>
      prev.map((set) =>
        set.id === selectedCountrySetId
          ? {
              ...set,
              countries: set.countries.map((country) =>
                country.id === countryId ? { ...country, flag } : country
              ),
            }
          : set
      )
    );
  };

  const handleToggleRule = (section, ruleId) => {
    setSiteEligibilityRules((prev) => ({
      ...prev,
      [section]: prev[section].map((rule) =>
        rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
      ),
    }));
  };

  const handleApplyGate = () => {
    setSiteShortlist(mockSites());
    handleSnackbar("Eligibility gate applied.");
  };

  const handleResetGate = () => {
    setSiteEligibilityRules((prev) =>
      Object.fromEntries(
        Object.entries(prev).map(([section, rules]) => [
          section,
          rules.map((rule) => ({ ...rule, enabled: false })),
        ])
      )
    );
    handleSnackbar("Rules reset.");
  };

  const handleSaveTemplate = () => {
    handleSnackbar("Eligibility template saved.");
  };

  const handleToggleInclude = (siteId) => {
    setSiteShortlist((prev) =>
      prev.map((site) => (site.id === siteId ? { ...site, include: !site.include } : site))
    );
  };

  const handleBulkAction = (action) => {
    setSiteShortlist((prev) =>
      prev.map((site) =>
        selectedSiteIds.includes(site.id)
          ? { ...site, include: action === "include" }
          : site
      )
    );
    handleSnackbar(`Bulk action applied: ${action}.`);
  };

  const handleToggleSelectSite = (siteId) => {
    setSelectedSiteIds((prev) =>
      prev.includes(siteId) ? prev.filter((id) => id !== siteId) : [...prev, siteId]
    );
  };

  const handlePrepareOutreach = () => {
    setOutreachList(mockOutreach());
    handleSnackbar("Outreach package prepared.");
  };

  const stepContent = useMemo(() => {
    switch (activeStep) {
      case 0:
        return (
          <PatientProfilesStep
            patientProfiles={patientProfiles}
            selectedProfiles={selectedProfiles}
            onGenerate={handleGenerateProfiles}
            onSelectProfile={handleSelectProfile}
            onOpenEvidence={handleOpenEvidence}
            onUpdateProfile={handleUpdateProfile}
            onDuplicateProfile={handleDuplicateProfile}
            onDiscardProfile={handleDiscardProfile}
          />
        );
      case 1:
        return (
          <CountryFeasibilityStep
            selectedProfiles={selectedProfiles}
            patientProfiles={patientProfiles}
            countrySets={countrySets}
            selectedCountrySetId={selectedCountrySetId}
            onSelectCountrySet={setSelectedCountrySetId}
            onDuplicateCountrySet={handleDuplicateCountrySet}
            onUpdateCountryFlag={handleUpdateCountryFlag}
            onRunTests={() => handleSnackbar("Country tests complete.")}
            onOpenEvidence={handleOpenEvidence}
            onExport={() => handleSnackbar("Country set exported.")}
          />
        );
      case 2:
        return (
          <SiteEligibilityStep
            siteEligibilityRules={siteEligibilityRules}
            onToggleRule={handleToggleRule}
            onApplyGate={handleApplyGate}
            onReset={handleResetGate}
            onSaveTemplate={handleSaveTemplate}
            includeUnknowns={includeUnknowns}
            onToggleUnknowns={() => setIncludeUnknowns((prev) => !prev)}
            onOpenEvidence={handleOpenEvidence}
          />
        );
      case 3:
        return (
          <SiteShortlistStep
            siteShortlist={siteShortlist}
            onToggleInclude={handleToggleInclude}
            onBulkAction={handleBulkAction}
            selectedSiteIds={selectedSiteIds}
            onToggleSelect={handleToggleSelectSite}
            onOpenEvidence={handleOpenEvidence}
            onExport={() => handleSnackbar("Shortlist exported.")}
          />
        );
      case 4:
        return (
          <OutreachPackageStep
            outreachList={outreachList}
            onPrepare={handlePrepareOutreach}
            onExport={() => handleSnackbar("Outreach list exported.")}
          />
        );
      default:
        return null;
    }
  }, [
    activeStep,
    patientProfiles,
    selectedProfiles,
    countrySets,
    selectedCountrySetId,
    siteEligibilityRules,
    includeUnknowns,
    siteShortlist,
    outreachList,
    selectedSiteIds,
  ]);

  return (
    <>
      <AppShell activeStep={activeStep} onStepChange={setActiveStep}>
        {stepContent}
      </AppShell>
      <EvidenceDrawer
        open={evidenceOpen}
        onClose={() => setEvidenceOpen(false)}
        contextTitle={evidenceContext}
        onRecompute={handleRecompute}
      />
      <ConfirmDialog
        open={confirmDialog.open}
        title="Discard profile?"
        description="This will remove the patient profile from the candidate list."
        onCancel={() => setConfirmDialog({ open: false, target: null })}
        onConfirm={confirmDiscardProfile}
      />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2400}
        message={snackbar.message}
        onClose={() => setSnackbar({ open: false, message: "" })}
      />
    </>
  );
}
