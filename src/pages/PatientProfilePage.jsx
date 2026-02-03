import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  Menu,
  MenuItem,
  OutlinedInput,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  Paper,
} from "@mui/material";
import { MoreVert } from "@mui/icons-material";
import { Fragment, useMemo, useState } from "react";

const biomarkersCatalog = [
  "EGFR",
  "ALK",
  "PD-L1",
  "BRCA",
  "HER2",
  "KRAS",
  "ROS1",
];

const initialProfiles = [
  {
    id: "pp-001",
    name: "Broad NSCLC",
    indication: "Non-small cell lung cancer",
    totalPatients: 1240,
    patientsPerCriteria: "120-240",
    sampleSize: 320,
    benchmarkStudies: 6,
    source: "Manual",
    addedBy: "Dr. K. Patel",
    modifiedBy: "E. Garner",
    criteriaTimeline: [
      {
        criterion: "Stage IV",
        value: "Required",
        ttfp: "3.2 wks",
        t25: "8.1 wks",
        t75: "18.4 wks",
        tLast: "26.9 wks",
      },
      {
        criterion: "ECOG 0-1",
        value: "Strict",
        ttfp: "4.0 wks",
        t25: "9.6 wks",
        t75: "20.2 wks",
        tLast: "29.4 wks",
      },
      {
        criterion: "No prior systemic therapy",
        value: "Directional",
        ttfp: "5.1 wks",
        t25: "11.3 wks",
        t75: "22.7 wks",
        tLast: "31.5 wks",
      },
    ],
    kpis: [
      { label: "Sample Size", value: "320", source: "Modeled" },
      { label: "Median Survival", value: "16.8 mo", source: "Benchmark" },
      { label: "Hazard Ratio", value: "0.74", source: "High confidence" },
      { label: "Response Rate", value: "38%", source: "Observed" },
    ],
    referenceStudies: [
      {
        name: "LUX-Lung 3",
        type: "Phase III",
        similarity: "High",
        outcome: "PFS benefit in 1L EGFR+",
      },
      {
        name: "KEYNOTE-189",
        type: "Phase III",
        similarity: "Medium",
        outcome: "IO + chemo OS improvement",
      },
    ],
  },
  {
    id: "pp-002",
    name: "EGFR+ Focused",
    indication: "Non-small cell lung cancer",
    totalPatients: 420,
    patientsPerCriteria: "60-90",
    sampleSize: 180,
    benchmarkStudies: 4,
    source: "Imported",
    addedBy: "M. Chen",
    modifiedBy: "M. Chen",
    criteriaTimeline: [
      {
        criterion: "EGFR exon 19/21",
        value: "Required",
        ttfp: "2.6 wks",
        t25: "6.2 wks",
        t75: "14.4 wks",
        tLast: "21.8 wks",
      },
      {
        criterion: "No prior TKI",
        value: "Directional",
        ttfp: "3.4 wks",
        t25: "7.9 wks",
        t75: "16.5 wks",
        tLast: "24.7 wks",
      },
    ],
    kpis: [
      { label: "Sample Size", value: "180", source: "Modeled" },
      { label: "Median Survival", value: "22.3 mo", source: "Benchmark" },
      { label: "Hazard Ratio", value: "0.62", source: "Medium confidence" },
      { label: "Response Rate", value: "58%", source: "Observed" },
    ],
    referenceStudies: [
      {
        name: "FLAURA",
        type: "Phase III",
        similarity: "High",
        outcome: "OS improvement with osimertinib",
      },
      {
        name: "LUX-Lung 7",
        type: "Phase II",
        similarity: "Medium",
        outcome: "PFS gains in EGFR+",
      },
    ],
  },
  {
    id: "pp-003",
    name: "PD-L1 Enriched",
    indication: "Non-small cell lung cancer",
    totalPatients: 640,
    patientsPerCriteria: "80-130",
    sampleSize: 240,
    benchmarkStudies: 5,
    source: "Recommended",
    addedBy: "S. Ivanov",
    modifiedBy: "S. Ivanov",
    criteriaTimeline: [
      {
        criterion: "PD-L1 ≥50%",
        value: "Required",
        ttfp: "3.8 wks",
        t25: "9.1 wks",
        t75: "19.8 wks",
        tLast: "28.2 wks",
      },
      {
        criterion: "Post chemo-IO",
        value: "Directional",
        ttfp: "4.5 wks",
        t25: "10.4 wks",
        t75: "21.7 wks",
        tLast: "30.6 wks",
      },
    ],
    kpis: [
      { label: "Sample Size", value: "240", source: "Modeled" },
      { label: "Median Survival", value: "14.1 mo", source: "Benchmark" },
      { label: "Hazard Ratio", value: "0.81", source: "Low confidence" },
      { label: "Response Rate", value: "33%", source: "Observed" },
    ],
    referenceStudies: [
      {
        name: "KEYNOTE-010",
        type: "Phase II",
        similarity: "Medium",
        outcome: "OS benefit in PD-L1 high",
      },
      {
        name: "CheckMate 057",
        type: "Phase III",
        similarity: "Low",
        outcome: "OS benefit in nonsquamous",
      },
    ],
  },
];

const emptyDraft = {
  id: "",
  name: "",
  indication: "",
  totalPatients: "",
  patientsPerCriteria: "",
  sampleSize: "",
  benchmarkStudies: "",
  source: "Manual",
  addedBy: "",
  modifiedBy: "",
};

const PatientProfilePage = () => {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [expandedId, setExpandedId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("create");
  const [draftProfile, setDraftProfile] = useState(emptyDraft);
  const [actionAnchor, setActionAnchor] = useState(null);
  const [actionProfileId, setActionProfileId] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [comparisonOpen, setComparisonOpen] = useState(false);

  const selectedProfiles = useMemo(
    () => profiles.filter((profile) => selectedIds.includes(profile.id)),
    [profiles, selectedIds]
  );

  const handleRowExpand = (profileId) => {
    setExpandedId((prev) => (prev === profileId ? null : profileId));
  };

  const handleSelectRow = (profileId) => {
    setSelectedIds((prev) =>
      prev.includes(profileId)
        ? prev.filter((id) => id !== profileId)
        : [...prev, profileId]
    );
  };

  const handleOpenDialog = (mode, profile = emptyDraft) => {
    setDialogMode(mode);
    setDraftProfile(profile);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setDraftProfile(emptyDraft);
  };

  const handleSaveDialog = () => {
    if (dialogMode === "edit") {
      setProfiles((prev) =>
        prev.map((profile) =>
          profile.id === draftProfile.id
            ? { ...profile, ...draftProfile, modifiedBy: "You" }
            : profile
        )
      );
    } else {
      const newProfile = {
        ...draftProfile,
        id: `pp-${Math.random().toString(36).slice(2, 8)}`,
        criteriaTimeline: [],
        kpis: [],
        referenceStudies: [],
      };
      setProfiles((prev) => [newProfile, ...prev]);
    }
    handleCloseDialog();
  };

  const handleActionOpen = (event, profileId) => {
    setActionAnchor(event.currentTarget);
    setActionProfileId(profileId);
  };

  const handleActionClose = () => {
    setActionAnchor(null);
    setActionProfileId(null);
  };

  const handleRowAction = (action) => {
    const profile = profiles.find((item) => item.id === actionProfileId);
    handleActionClose();
    if (!profile) {
      return;
    }

    if (action === "edit") {
      handleOpenDialog("edit", profile);
    }

    if (action === "duplicate") {
      const duplicate = {
        ...profile,
        id: `pp-${Math.random().toString(36).slice(2, 8)}`,
        name: `${profile.name} (Copy)`,
        source: "Manual",
        addedBy: "You",
        modifiedBy: "You",
      };
      setProfiles((prev) => [duplicate, ...prev]);
    }

    if (action === "delete") {
      setSelectedIds([profile.id]);
      setDeleteConfirmOpen(true);
    }

    if (action === "compare") {
      setSelectedIds([profile.id]);
      setComparisonOpen(true);
    }
  };

  const handleDeleteProfiles = () => {
    setProfiles((prev) => prev.filter((profile) => !selectedIds.includes(profile.id)));
    setSelectedIds([]);
    setDeleteConfirmOpen(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Typography variant="h5">Patient Profiles</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            onClick={() => handleOpenDialog("create", emptyDraft)}
          >
            + Create Patient Profile
          </Button>
          <Button
            variant="outlined"
            disabled={selectedIds.length === 0}
            onClick={() => setDeleteConfirmOpen(true)}
          >
            Delete Patient Profile
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Indication</TableCell>
              <TableCell>Total Patients</TableCell>
              <TableCell>No. Patients / Criteria</TableCell>
              <TableCell>Sample Size</TableCell>
              <TableCell>No. Benchmark Studies</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Added By</TableCell>
              <TableCell>Modified By</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {profiles.map((profile) => {
              const isExpanded = expandedId === profile.id;
              return (
                <Fragment key={profile.id}>
                  <TableRow
                    hover
                    selected={selectedIds.includes(profile.id)}
                    onClick={() => handleRowExpand(profile.id)}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell>
                      <Typography variant="subtitle2">{profile.name}</Typography>
                    </TableCell>
                    <TableCell>{profile.indication}</TableCell>
                    <TableCell>{profile.totalPatients}</TableCell>
                    <TableCell>{profile.patientsPerCriteria}</TableCell>
                    <TableCell>{profile.sampleSize}</TableCell>
                    <TableCell>{profile.benchmarkStudies}</TableCell>
                    <TableCell>{profile.source}</TableCell>
                    <TableCell>{profile.addedBy}</TableCell>
                    <TableCell>{profile.modifiedBy}</TableCell>
                    <TableCell align="right" onClick={(event) => event.stopPropagation()}>
                      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                        <Checkbox
                          size="small"
                          checked={selectedIds.includes(profile.id)}
                          onChange={() => handleSelectRow(profile.id)}
                        />
                        <Tooltip title="Profile actions">
                          <IconButton
                            size="small"
                            onClick={(event) => handleActionOpen(event, profile.id)}
                          >
                            <MoreVert fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={10} sx={{ p: 0, borderBottom: 0 }}>
                      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        {/* Row expansion is scoped to a single profile to avoid turning this page into a global dashboard. */}
                        <Box sx={{ p: 2, backgroundColor: "rgba(0, 0, 0, 0.02)" }}>
                          <Typography variant="subtitle1" sx={{ mb: 1 }}>
                            Criteria timeline (row-scoped)
                          </Typography>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Criterion</TableCell>
                                <TableCell>Value</TableCell>
                                <TableCell>Avg. Time to First Patient</TableCell>
                                <TableCell>Avg. Time to 25% Patients</TableCell>
                                <TableCell>Avg. Time to 75% Patients</TableCell>
                                <TableCell>Avg. Time to Last Patient</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {profile.criteriaTimeline.map((row) => (
                                <TableRow key={row.criterion}>
                                  <TableCell>{row.criterion}</TableCell>
                                  <TableCell>{row.value}</TableCell>
                                  <TableCell>{row.ttfp}</TableCell>
                                  <TableCell>{row.t25}</TableCell>
                                  <TableCell>{row.t75}</TableCell>
                                  <TableCell>{row.tLast}</TableCell>
                                </TableRow>
                              ))}
                              {profile.criteriaTimeline.length === 0 ? (
                                <TableRow>
                                  <TableCell colSpan={6}>
                                    <Typography variant="body2" color="text.secondary">
                                      No criteria timeline captured yet.
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              ) : null}
                            </TableBody>
                          </Table>

                          <Divider sx={{ my: 2 }} />

                          <Typography variant="subtitle1" sx={{ mb: 1 }}>
                            Profile KPIs
                          </Typography>
                          <Grid container spacing={2}>
                            {profile.kpis.map((kpi) => (
                              <Grid item xs={12} sm={6} md={3} key={kpi.label}>
                                <Card variant="outlined" sx={{ height: "100%" }}>
                                  <CardContent>
                                    <Typography variant="overline" color="text.secondary">
                                      {kpi.label}
                                    </Typography>
                                    <Typography variant="h6" sx={{ mt: 0.5 }}>
                                      {kpi.value}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      Source: {kpi.source}
                                    </Typography>
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                            {profile.kpis.length === 0 ? (
                              <Grid item xs={12}>
                                <Typography variant="body2" color="text.secondary">
                                  KPIs will appear here as evidence is linked.
                                </Typography>
                              </Grid>
                            ) : null}
                          </Grid>

                          <Divider sx={{ my: 2 }} />

                          <Typography variant="subtitle1" sx={{ mb: 1 }}>
                            Reference studies
                          </Typography>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Reference Study</TableCell>
                                <TableCell>Study Type</TableCell>
                                <TableCell>Population Similarity</TableCell>
                                <TableCell>Key Outcome Summary</TableCell>
                                <TableCell>Actions</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {profile.referenceStudies.map((study) => (
                                <TableRow key={study.name}>
                                  <TableCell>{study.name}</TableCell>
                                  <TableCell>{study.type}</TableCell>
                                  <TableCell>{study.similarity}</TableCell>
                                  <TableCell>{study.outcome}</TableCell>
                                  <TableCell>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      onClick={() => setComparisonOpen(true)}
                                    >
                                      Compare
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                              {profile.referenceStudies.length === 0 ? (
                                <TableRow>
                                  <TableCell colSpan={5}>
                                    <Typography variant="body2" color="text.secondary">
                                      Link benchmark studies to support this profile.
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              ) : null}
                            </TableBody>
                          </Table>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={actionAnchor}
        open={Boolean(actionAnchor)}
        onClose={handleActionClose}
      >
        <MenuItem onClick={() => handleRowAction("edit")}>Edit profile</MenuItem>
        <MenuItem onClick={() => handleRowAction("duplicate")}>
          Duplicate profile
        </MenuItem>
        <MenuItem onClick={() => handleRowAction("delete")}>Delete profile</MenuItem>
        <Divider />
        <MenuItem onClick={() => handleRowAction("compare")}>
          Open comparison view
        </MenuItem>
      </Menu>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {dialogMode === "edit" ? "Edit Patient Profile" : "New Patient Profile"}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "grid", gap: 2, mt: 1 }}>
            <TextField
              label="Profile name"
              value={draftProfile.name}
              onChange={(event) =>
                setDraftProfile((prev) => ({
                  ...prev,
                  name: event.target.value,
                }))
              }
            />
            <TextField
              label="Indication"
              value={draftProfile.indication}
              onChange={(event) =>
                setDraftProfile((prev) => ({
                  ...prev,
                  indication: event.target.value,
                }))
              }
            />
            <TextField
              label="Total patients"
              value={draftProfile.totalPatients}
              onChange={(event) =>
                setDraftProfile((prev) => ({
                  ...prev,
                  totalPatients: event.target.value,
                }))
              }
            />
            <TextField
              label="No. patients / criteria"
              value={draftProfile.patientsPerCriteria}
              onChange={(event) =>
                setDraftProfile((prev) => ({
                  ...prev,
                  patientsPerCriteria: event.target.value,
                }))
              }
            />
            <TextField
              label="Sample size"
              value={draftProfile.sampleSize}
              onChange={(event) =>
                setDraftProfile((prev) => ({
                  ...prev,
                  sampleSize: event.target.value,
                }))
              }
            />
            <TextField
              label="No. benchmark studies"
              value={draftProfile.benchmarkStudies}
              onChange={(event) =>
                setDraftProfile((prev) => ({
                  ...prev,
                  benchmarkStudies: event.target.value,
                }))
              }
            />
            <FormControl>
              <InputLabel>Source</InputLabel>
              <Select
                value={draftProfile.source}
                label="Source"
                onChange={(event) =>
                  setDraftProfile((prev) => ({
                    ...prev,
                    source: event.target.value,
                  }))
                }
              >
                {["Manual", "Imported", "Recommended"].map((value) => (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <InputLabel>Benchmark markers</InputLabel>
              <Select
                multiple
                value={draftProfile.biomarkers || []}
                onChange={(event) =>
                  setDraftProfile((prev) => ({
                    ...prev,
                    biomarkers: event.target.value,
                  }))
                }
                input={<OutlinedInput label="Benchmark markers" />}
                renderValue={(selected) => selected.join(", ")}
              >
                {biomarkersCatalog.map((marker) => (
                  <MenuItem key={marker} value={marker}>
                    {marker}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Added by"
              value={draftProfile.addedBy}
              onChange={(event) =>
                setDraftProfile((prev) => ({
                  ...prev,
                  addedBy: event.target.value,
                }))
              }
            />
            <TextField
              label="Modified by"
              value={draftProfile.modifiedBy}
              onChange={(event) =>
                setDraftProfile((prev) => ({
                  ...prev,
                  modifiedBy: event.target.value,
                }))
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveDialog}>
            Save Profile
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Delete patient profile</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2">
            This action removes the selected profile(s). Confirm to continue.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteProfiles}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={comparisonOpen}
        onClose={() => setComparisonOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Comparison view (placeholder)</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            A dedicated comparison view will be rendered here when invoked.
          </Typography>
          {selectedProfiles.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Select a profile or reference study to compare.
            </Typography>
          ) : (
            selectedProfiles.map((profile) => (
              <Paper key={profile.id} variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle2">{profile.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {profile.indication}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2">
                  Sample size: {profile.sampleSize}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Benchmark studies: {profile.benchmarkStudies}
                </Typography>
              </Paper>
            ))
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setComparisonOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PatientProfilePage;
