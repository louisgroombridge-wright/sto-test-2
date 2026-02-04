import {
  Box,
  Chip,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  Button,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useMemo, useState } from "react";

const initialSites = [
  {
    siteId: "us-001",
    siteName: "Horizon Cancer Institute",
    country: "United States",
    city: "Boston, MA",
    historicalEnrollmentRate: "18 patients/month",
    timeToFirstPatient: "42 days",
    siteActivationTime: "58 days",
    screeningSuccessRate: "71%",
    dropoutRate: "9%",
    priorTrialExperience: "Yes",
    competitiveTrialOverlap: "3 trials",
    compositeSiteScore: "Vendor A-",
    niceToHaveCriteriaMet: "Yes",
    createdBy: "J. Morgan",
    updatedBy: "S. Patel",
    decisionStatus: "Pending",
    decisionBy: "",
    decisionAt: "",
    notes: "",
  },
  {
    siteId: "de-002",
    siteName: "Bavaria University Hospital",
    country: "Germany",
    city: "Munich",
    historicalEnrollmentRate: "12 patients/month",
    timeToFirstPatient: "55 days",
    siteActivationTime: "63 days",
    screeningSuccessRate: "65%",
    dropoutRate: "11%",
    priorTrialExperience: "Partial",
    competitiveTrialOverlap: "2 trials",
    compositeSiteScore: "Unknown",
    niceToHaveCriteriaMet: "No",
    createdBy: "J. Morgan",
    updatedBy: "S. Patel",
    decisionStatus: "Pending",
    decisionBy: "",
    decisionAt: "",
    notes: "",
  },
  {
    siteId: "jp-004",
    siteName: "Kanto Oncology Center",
    country: "Japan",
    city: "Tokyo",
    historicalEnrollmentRate: "Unknown",
    timeToFirstPatient: "Unknown",
    siteActivationTime: "72 days",
    screeningSuccessRate: "Unknown",
    dropoutRate: "6%",
    priorTrialExperience: "No",
    competitiveTrialOverlap: "Unknown",
    compositeSiteScore: "Vendor B",
    niceToHaveCriteriaMet: "Yes",
    createdBy: "L. Chen",
    updatedBy: "L. Chen",
    decisionStatus: "Pending",
    decisionBy: "",
    decisionAt: "",
    notes: "",
  },
];

const formatTimestamp = () =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());

const SiteRecommendationPage = () => {
  const [sites, setSites] = useState(initialSites);
  const [selectedSites, setSelectedSites] = useState({});
  const [searchValue, setSearchValue] = useState("");
  const [niceToHaveFilter, setNiceToHaveFilter] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("");
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [activeSiteId, setActiveSiteId] = useState("");
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [evidenceDialogOpen, setEvidenceDialogOpen] = useState(false);

  const handleSelectSite = (siteId, checked) => {
    setSelectedSites((prev) => ({
      ...prev,
      [siteId]: checked,
    }));
  };

  const handleMenuOpen = (event, siteId) => {
    setMenuAnchor(event.currentTarget);
    setActiveSiteId(siteId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setActiveSiteId("");
  };

  const updateDecision = (siteId, status) => {
    setSites((prev) =>
      prev.map((site) =>
        site.siteId === siteId
          ? {
              ...site,
              decisionStatus: status,
              decisionBy: "J. Morgan",
              decisionAt: formatTimestamp(),
            }
          : site
      )
    );
  };

  const handleInclude = () => {
    updateDecision(activeSiteId, "Included");
    handleMenuClose();
  };

  const handleExclude = () => {
    updateDecision(activeSiteId, "Excluded");
    handleMenuClose();
  };

  const handleOpenNoteDialog = () => {
    const activeSite = sites.find((site) => site.siteId === activeSiteId);
    setNoteDraft(activeSite?.notes ?? "");
    setNoteDialogOpen(true);
    handleMenuClose();
  };

  const handleSaveNote = () => {
    setSites((prev) =>
      prev.map((site) =>
        site.siteId === activeSiteId
          ? {
              ...site,
              notes: noteDraft,
              decisionBy: site.decisionStatus !== "Pending" ? site.decisionBy || "J. Morgan" : "",
              decisionAt:
                site.decisionStatus !== "Pending" ? site.decisionAt || formatTimestamp() : "",
            }
          : site
      )
    );
    setNoteDialogOpen(false);
  };

  const handleViewEvidence = () => {
    setEvidenceDialogOpen(true);
    handleMenuClose();
  };

  const filteredSites = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();
    return sites.filter((site) => {
      const matchesSearch =
        !normalizedSearch ||
        [site.siteName, site.country, site.city]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedSearch));
      const matchesNiceToHave =
        !niceToHaveFilter || site.niceToHaveCriteriaMet === niceToHaveFilter;
      const matchesExperience =
        !experienceFilter || site.priorTrialExperience === experienceFilter;
      return matchesSearch && matchesNiceToHave && matchesExperience;
    });
  }, [sites, searchValue, niceToHaveFilter, experienceFilter]);

  const summary = useMemo(() => {
    const selectedIds = Object.keys(selectedSites).filter((siteId) => selectedSites[siteId]);
    const selectedCount = selectedIds.length;
    const includedCount = sites.filter((site) => site.decisionStatus === "Included").length;
    const excludedCount = sites.filter((site) => site.decisionStatus === "Excluded").length;
    return { selectedCount, includedCount, excludedCount };
  }, [selectedSites, sites]);

  return (
    <Box sx={{ p: 4, display: "flex", flexDirection: "column", gap: 3 }}>
      <Paper elevation={0} sx={{ border: "1px solid rgba(0, 0, 0, 0.12)" }}>
        <Toolbar sx={{ gap: 2, flexWrap: "wrap" }}>
          <TextField
            label="Search"
            placeholder="Search sites, countries, cities"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            size="small"
            sx={{ minWidth: 260 }}
          />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="nice-to-have-filter-label">Nice-to-have</InputLabel>
            <Select
              labelId="nice-to-have-filter-label"
              label="Nice-to-have"
              value={niceToHaveFilter}
              onChange={(event) => setNiceToHaveFilter(event.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Yes">Yes</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel id="experience-filter-label">Prior trial experience</InputLabel>
            <Select
              labelId="experience-filter-label"
              label="Prior trial experience"
              value={experienceFilter}
              onChange={(event) => setExperienceFilter(event.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Yes">Yes</MenuItem>
              <MenuItem value="Partial">Partial</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </Select>
          </FormControl>
          {/* Filters are user-directed to inspect trade-offs; no automatic ranking is applied. */}
        </Toolbar>
      </Paper>

      <Paper elevation={0} sx={{ border: "1px solid rgba(0, 0, 0, 0.12)" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Select</TableCell>
              <TableCell>Site Name</TableCell>
              <TableCell>Country</TableCell>
              <TableCell>City</TableCell>
              <TableCell>Historical Enrollment Rate</TableCell>
              <TableCell>Time to First Patient</TableCell>
              <TableCell>Site Activation Time</TableCell>
              <TableCell>Screening Success Rate</TableCell>
              <TableCell>Dropout Rate</TableCell>
              <TableCell>Prior Trial Experience</TableCell>
              <TableCell>Competitive Trial Overlap</TableCell>
              <TableCell>Composite Site Score</TableCell>
              <TableCell>Nice-to-Have Criteria Met</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell>Updated By</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSites.map((site) => (
              <TableRow key={site.siteId} hover>
                <TableCell>
                  <Checkbox
                    checked={!!selectedSites[site.siteId]}
                    onChange={(event) => handleSelectSite(site.siteId, event.target.checked)}
                  />
                </TableCell>
                <TableCell>
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle2">{site.siteName}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {site.siteId}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>{site.country || "Unknown"}</TableCell>
                <TableCell>{site.city || "Unknown"}</TableCell>
                {/* Metrics remain side-by-side to avoid hiding trade-offs behind a single score. */}
                <TableCell>{site.historicalEnrollmentRate || "Unknown"}</TableCell>
                <TableCell>{site.timeToFirstPatient || "Unknown"}</TableCell>
                <TableCell>{site.siteActivationTime || "Unknown"}</TableCell>
                <TableCell>{site.screeningSuccessRate || "Unknown"}</TableCell>
                <TableCell>{site.dropoutRate || "Unknown"}</TableCell>
                <TableCell>{site.priorTrialExperience || "Unknown"}</TableCell>
                <TableCell>{site.competitiveTrialOverlap || "Unknown"}</TableCell>
                <TableCell>{site.compositeSiteScore || "Unknown"}</TableCell>
                <TableCell>
                  <Chip
                    label={site.niceToHaveCriteriaMet || "Unknown"}
                    size="small"
                    color={site.niceToHaveCriteriaMet === "Yes" ? "success" : "default"}
                    variant={site.niceToHaveCriteriaMet === "Yes" ? "filled" : "outlined"}
                  />
                </TableCell>
                <TableCell>{site.createdBy || "Unknown"}</TableCell>
                <TableCell>{site.updatedBy || "Unknown"}</TableCell>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Chip
                      label={site.decisionStatus}
                      size="small"
                      color={
                        site.decisionStatus === "Included"
                          ? "success"
                          : site.decisionStatus === "Excluded"
                          ? "default"
                          : "warning"
                      }
                      variant={site.decisionStatus === "Excluded" ? "outlined" : "filled"}
                    />
                    <Tooltip title="Actions">
                      <IconButton size="small" onClick={(event) => handleMenuOpen(event, site.siteId)}>
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {site.decisionAt
                      ? `Decision by ${site.decisionBy} on ${site.decisionAt}`
                      : "No decision recorded"}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Paper elevation={0} sx={{ border: "1px solid rgba(0, 0, 0, 0.12)", p: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Selection summary
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Chip label={`Selected rows: ${summary.selectedCount}`} />
          <Chip label={`Included: ${summary.includedCount}`} color="success" />
          <Chip label={`Excluded: ${summary.excludedCount}`} variant="outlined" />
        </Stack>
      </Paper>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        <MenuItem onClick={handleInclude}>Include site</MenuItem>
        <MenuItem onClick={handleExclude}>Exclude site</MenuItem>
        <MenuItem onClick={handleOpenNoteDialog}>Add note</MenuItem>
        <MenuItem onClick={handleViewEvidence}>View evidence</MenuItem>
      </Menu>

      <Dialog open={noteDialogOpen} onClose={() => setNoteDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add note</DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          <TextField
            label="Note"
            placeholder="Capture governance notes or rationale"
            value={noteDraft}
            onChange={(event) => setNoteDraft(event.target.value)}
            multiline
            minRows={3}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNoteDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveNote}>
            Save note
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={evidenceDialogOpen}
        onClose={() => setEvidenceDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Evidence sources</DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Evidence is displayed for reviewer context only; it does not auto-include or auto-exclude
            sites.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEvidenceDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SiteRecommendationPage;
