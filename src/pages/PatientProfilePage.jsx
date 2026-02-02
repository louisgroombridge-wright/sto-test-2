import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  FormControl,
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
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
  Paper,
} from "@mui/material";
import { useMemo, useState } from "react";
import { MoreVert } from "@mui/icons-material";

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
    disease: "Non-small cell lung cancer",
    lineOfTherapy: "1L",
    biomarkers: ["EGFR", "PD-L1"],
    inclusionSummary: "Stage IV, ECOG 0-1, no prior systemic therapy.",
    exclusionSummary: "Active CNS metastases, prior EGFR TKIs.",
    detailLevel: "Medium",
    percentExcluded: "Low",
    confidenceLevel: "Medium",
    source: "Manual",
    status: "Active",
    creationMethod: "Manual",
    parentId: null,
    recommendedReason: "",
    lastModified: "2024-04-10 09:30",
    isActiveSelection: true,
  },
  {
    id: "pp-002",
    name: "EGFR+ Focused",
    disease: "Non-small cell lung cancer",
    lineOfTherapy: "1L",
    biomarkers: ["EGFR"],
    inclusionSummary: "EGFR exon 19/21, no prior TKI exposure.",
    exclusionSummary: "EGFR exon 20 insertion, active brain mets.",
    detailLevel: "High",
    percentExcluded: "Medium",
    confidenceLevel: "High",
    source: "Derived",
    status: "Active",
    creationMethod: "Variant",
    parentId: "pp-001",
    recommendedReason: "",
    lastModified: "2024-04-12 14:10",
    isActiveSelection: true,
  },
  {
    id: "pp-003",
    name: "PD-L1 Enriched",
    disease: "Non-small cell lung cancer",
    lineOfTherapy: "2L",
    biomarkers: ["PD-L1"],
    inclusionSummary: "PD-L1 ≥50%, post chemo-IO.",
    exclusionSummary: "Prior PD-1/PD-L1 combination therapy.",
    detailLevel: "Low",
    percentExcluded: "High",
    confidenceLevel: "Low",
    source: "Recommended",
    status: "Active",
    creationMethod: "Recommended",
    parentId: null,
    recommendedReason: "AI suggested a more restrictive cohort for sensitivity.",
    lastModified: "2024-04-12 16:45",
    isActiveSelection: false,
  },
];

const sortableColumns = {
  percentExcluded: ["Low", "Medium", "High"],
  confidenceLevel: ["Low", "Medium", "High"],
  detailLevel: ["Low", "Medium", "High"],
};

const emptyDraft = {
  id: "",
  name: "",
  disease: "",
  lineOfTherapy: "",
  biomarkers: [],
  inclusionSummary: "",
  exclusionSummary: "",
  detailLevel: "Medium",
  percentExcluded: "Medium",
  confidenceLevel: "Medium",
  source: "Manual",
  status: "Active",
  creationMethod: "Manual",
  parentId: null,
  recommendedReason: "",
  lastModified: "",
  isActiveSelection: false,
};

const formatTimestamp = () => {
  const now = new Date();
  return now.toISOString().slice(0, 16).replace("T", " ");
};

const recommendProfiles = () => {
  // Placeholder for AI-assisted profile generation.
  // In a real implementation, this would call a service to create 2-5 options.
  return [
    {
      name: "Narrow Biomarker+ Cohort",
      disease: "Non-small cell lung cancer",
      lineOfTherapy: "2L",
      biomarkers: ["ALK", "ROS1"],
      inclusionSummary: "ALK/ROS1 positive, post platinum doublet.",
      exclusionSummary: "Prior ALK/ROS1 inhibitor exposure.",
      detailLevel: "High",
      percentExcluded: "High",
      confidenceLevel: "Medium",
      recommendedReason: "Introduces a high-specificity cohort for feasibility stress-testing.",
    },
    {
      name: "Broad 2L Population",
      disease: "Non-small cell lung cancer",
      lineOfTherapy: "2L",
      biomarkers: ["PD-L1"],
      inclusionSummary: "Previously treated, ECOG 0-2.",
      exclusionSummary: "Uncontrolled CNS disease.",
      detailLevel: "Low",
      percentExcluded: "Low",
      confidenceLevel: "Low",
      recommendedReason: "Adds a broader option for enrollment projections.",
    },
  ];
};

const PatientProfilePage = () => {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [sortBy, setSortBy] = useState({ key: "percentExcluded", order: "asc" });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("new");
  const [draftProfile, setDraftProfile] = useState(emptyDraft);
  const [actionAnchor, setActionAnchor] = useState(null);
  const [actionProfileId, setActionProfileId] = useState(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [selectionError, setSelectionError] = useState("");

  const selectedProfiles = useMemo(
    () => profiles.filter((profile) => selectedIds.includes(profile.id)),
    [profiles, selectedIds]
  );

  const filteredProfiles = useMemo(() => {
    if (!searchValue.trim()) {
      return profiles;
    }
    const search = searchValue.toLowerCase();
    return profiles.filter((profile) => {
      const biomarkerMatch = profile.biomarkers.some((marker) =>
        marker.toLowerCase().includes(search)
      );
      return (
        profile.name.toLowerCase().includes(search) ||
        profile.disease.toLowerCase().includes(search) ||
        biomarkerMatch
      );
    });
  }, [profiles, searchValue]);

  const sortedProfiles = useMemo(() => {
    const options = sortableColumns[sortBy.key];
    return [...filteredProfiles].sort((a, b) => {
      const aIndex = options.indexOf(a[sortBy.key]);
      const bIndex = options.indexOf(b[sortBy.key]);
      if (aIndex === bIndex) {
        return a.name.localeCompare(b.name);
      }
      return sortBy.order === "asc" ? aIndex - bIndex : bIndex - aIndex;
    });
  }, [filteredProfiles, sortBy]);

  const pagedProfiles = useMemo(() => {
    const start = page * rowsPerPage;
    return sortedProfiles.slice(start, start + rowsPerPage);
  }, [sortedProfiles, page, rowsPerPage]);

  const activeCount = useMemo(
    () => profiles.filter((profile) => profile.isActiveSelection).length,
    [profiles]
  );

  const showBlocker =
    profiles.length === 0 || activeCount < 1 || activeCount > 3;

  const blockerMessage = useMemo(() => {
    if (profiles.length === 0) {
      return "Add at least one patient profile option to continue.";
    }
    if (activeCount < 1) {
      return "Select at least one active profile to proceed to the next step.";
    }
    if (activeCount > 3) {
      return "Only up to 3 profiles can be marked active for downstream steps.";
    }
    return "";
  }, [profiles.length, activeCount]);

  const handleSort = (key) => {
    setSortBy((prev) => {
      if (prev.key === key) {
        return { key, order: prev.order === "asc" ? "desc" : "asc" };
      }
      return { key, order: "asc" };
    });
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedIds(filteredProfiles.map((profile) => profile.id));
      setSelectionError("");
      return;
    }
    setSelectedIds([]);
    setSelectionError("");
  };

  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]
    );
    setSelectionError("");
  };

  const openDialog = (mode, profile = emptyDraft) => {
    setDialogMode(mode);
    setDraftProfile(profile);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setDraftProfile(emptyDraft);
  };

  const handleDialogSave = () => {
    const timestamp = formatTimestamp();
    if (dialogMode === "edit") {
      setProfiles((prev) =>
        prev.map((profile) =>
          profile.id === draftProfile.id
            ? { ...draftProfile, lastModified: timestamp }
            : profile
        )
      );
    } else {
      const derivedSource =
        dialogMode === "variant" ? "Derived" : draftProfile.source;
      const newProfile = {
        ...draftProfile,
        id: `pp-${Math.random().toString(36).slice(2, 8)}`,
        source: derivedSource,
        lastModified: timestamp,
      };
      setProfiles((prev) => [newProfile, ...prev]);
    }
    handleDialogClose();
  };

  const handleRecommendProfiles = () => {
    const recommended = recommendProfiles();
    const timestamp = formatTimestamp();
    const newProfiles = recommended.map((profile) => ({
      ...emptyDraft,
      ...profile,
      id: `pp-${Math.random().toString(36).slice(2, 8)}`,
      source: "Recommended",
      creationMethod: "Recommended",
      status: "Active",
      lastModified: timestamp,
    }));
    setProfiles((prev) => [...newProfiles, ...prev]);
  };

  const handleBulkDuplicate = () => {
    const timestamp = formatTimestamp();
    setProfiles((prev) => [
      ...selectedProfiles.map((profile) => ({
        ...profile,
        id: `pp-${Math.random().toString(36).slice(2, 8)}`,
        name: `${profile.name} (Copy)`,
        source: "Derived",
        creationMethod: "Variant",
        parentId: profile.id,
        lastModified: timestamp,
      })),
      ...prev,
    ]);
    setSelectedIds([]);
  };

  const handleBulkArchive = () => {
    setProfiles((prev) =>
      prev.map((profile) =>
        selectedIds.includes(profile.id)
          ? { ...profile, status: "Archived", isActiveSelection: false }
          : profile
      )
    );
    setSelectedIds([]);
  };

  const handleBulkCompare = () => {
    setCompareOpen(true);
  };

  const handleSetActive = () => {
    const currentActiveNotSelected = profiles.filter(
      (profile) =>
        profile.isActiveSelection && !selectedIds.includes(profile.id)
    ).length;
    const nextActiveCount = currentActiveNotSelected + selectedProfiles.length;
    // Guardrail: downstream steps allow 1-3 active profiles only.
    if (nextActiveCount > 3) {
      setSelectionError("Select up to 3 profiles to set as active.");
      return;
    }
    setSelectionError("");
    setProfiles((prev) =>
      prev.map((profile) =>
        selectedIds.includes(profile.id)
          ? { ...profile, isActiveSelection: true }
          : profile
      )
    );
    setSelectedIds([]);
  };

  const handleRowActionOpen = (event, profileId) => {
    setActionAnchor(event.currentTarget);
    setActionProfileId(profileId);
  };

  const handleRowActionClose = () => {
    setActionAnchor(null);
    setActionProfileId(null);
  };

  const handleAction = (action) => {
    const profile = profiles.find((item) => item.id === actionProfileId);
    handleRowActionClose();
    if (!profile) {
      return;
    }
    const timestamp = formatTimestamp();

    if (action === "edit") {
      openDialog("edit", profile);
    }
    if (action === "duplicate") {
      setProfiles((prev) => [
        {
          ...profile,
          id: `pp-${Math.random().toString(36).slice(2, 8)}`,
          name: `${profile.name} (Copy)`,
          source: "Derived",
          creationMethod: "Variant",
          parentId: profile.id,
          lastModified: timestamp,
        },
        ...prev,
      ]);
    }
    if (action === "variant") {
      openDialog("variant", {
        ...profile,
        id: "",
        name: `${profile.name} Variant`,
        source: "Derived",
        creationMethod: "Variant",
        parentId: profile.id,
      });
    }
    if (action === "archive") {
      setProfiles((prev) =>
        prev.map((item) =>
          item.id === profile.id
            ? {
                ...item,
                status: "Archived",
                isActiveSelection: false,
                lastModified: timestamp,
              }
            : item
        )
      );
    }
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
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            onClick={() => openDialog("new", emptyDraft)}
          >
            + New Patient Profile
          </Button>
          <Button variant="outlined" onClick={handleRecommendProfiles}>
            Recommend Profiles
          </Button>
        </Box>
        <TextField
          placeholder="Search by name, indication, biomarker"
          size="small"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          sx={{ minWidth: 280 }}
        />
      </Box>

      {showBlocker ? (
        <Paper
          elevation={0}
          sx={{
            mb: 2,
            p: 2,
            border: "1px solid rgba(0, 0, 0, 0.12)",
            backgroundColor: "rgba(255, 193, 7, 0.12)",
          }}
        >
          <Typography variant="subtitle2">{blockerMessage}</Typography>
        </Paper>
      ) : null}

      {selectedIds.length > 0 ? (
        <Paper
          elevation={0}
          sx={{
            mb: 2,
            p: 2,
            border: "1px solid rgba(0, 0, 0, 0.12)",
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            alignItems: "center",
          }}
        >
          <Typography variant="subtitle2" sx={{ mr: 2 }}>
            {selectedIds.length} selected
          </Typography>
          <Button size="small" variant="outlined" onClick={handleBulkDuplicate}>
            Duplicate selected
          </Button>
          <Button size="small" variant="outlined" onClick={handleBulkArchive}>
            Archive selected
          </Button>
          <Button size="small" variant="outlined" onClick={handleBulkCompare}>
            Compare selected
          </Button>
          <Tooltip
            title={
              selectedIds.length > 3
                ? "Select up to 3 profiles to set as active."
                : ""
            }
          >
            <span>
              <Button
                size="small"
                variant="contained"
                onClick={handleSetActive}
                disabled={selectedIds.length > 3}
              >
                Set as active for next step
              </Button>
            </span>
          </Tooltip>
          {selectionError ? (
            <Typography variant="caption" color="error">
              {selectionError}
            </Typography>
          ) : null}
        </Paper>
      ) : null}

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={
                    selectedIds.length > 0 &&
                    selectedIds.length < filteredProfiles.length
                  }
                  checked={
                    filteredProfiles.length > 0 &&
                    selectedIds.length === filteredProfiles.length
                  }
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Indication</TableCell>
              <TableCell>Line of Therapy</TableCell>
              <TableCell>Biomarkers</TableCell>
              <TableCell>Eligibility Snapshot</TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy.key === "detailLevel"}
                  direction={sortBy.order}
                  onClick={() => handleSort("detailLevel")}
                >
                  Detail Level
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy.key === "percentExcluded"}
                  direction={sortBy.order}
                  onClick={() => handleSort("percentExcluded")}
                >
                  % Excluded
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy.key === "confidenceLevel"}
                  direction={sortBy.order}
                  onClick={() => handleSort("confidenceLevel")}
                >
                  Confidence
                </TableSortLabel>
              </TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pagedProfiles.map((profile) => (
              <TableRow key={profile.id} hover>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedIds.includes(profile.id)}
                    onChange={() => handleSelectRow(profile.id)}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <Typography variant="subtitle2">{profile.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Last updated {profile.lastModified}
                    </Typography>
                    {profile.isActiveSelection ? (
                      <Chip
                        label="Active option"
                        size="small"
                        color="success"
                        variant="outlined"
                        sx={{ mt: 0.5, width: "fit-content" }}
                      />
                    ) : null}
                  </Box>
                </TableCell>
                <TableCell>{profile.disease}</TableCell>
                <TableCell>{profile.lineOfTherapy}</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {profile.biomarkers.slice(0, 2).map((marker) => (
                      <Chip
                        key={marker}
                        label={marker}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                    {profile.biomarkers.length > 2 ? (
                      <Tooltip title={profile.biomarkers.join(", ")}>
                        <Chip
                          label={`+${profile.biomarkers.length - 2}`}
                          size="small"
                          variant="outlined"
                        />
                      </Tooltip>
                    ) : null}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {profile.inclusionSummary}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Exclusions: {profile.exclusionSummary}
                  </Typography>
                </TableCell>
                <TableCell>{profile.detailLevel}</TableCell>
                <TableCell>{profile.percentExcluded}</TableCell>
                <TableCell>{profile.confidenceLevel}</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                    <Chip
                      label={profile.source}
                      size="small"
                      variant="outlined"
                    />
                    {profile.recommendedReason ? (
                      <Tooltip title={profile.recommendedReason}>
                        <Chip
                          label="Why recommended"
                          size="small"
                          color="info"
                          variant="outlined"
                        />
                      </Tooltip>
                    ) : null}
                  </Box>
                </TableCell>
                <TableCell>{profile.status}</TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    onClick={(event) => handleRowActionOpen(event, profile.id)}
                  >
                    <MoreVert />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          rowsPerPageOptions={[5, 10, 25]}
          count={sortedProfiles.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, nextPage) => setPage(nextPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>

      <Menu
        anchorEl={actionAnchor}
        open={Boolean(actionAnchor)}
        onClose={handleRowActionClose}
      >
        <MenuItem onClick={() => handleAction("edit")}>Edit</MenuItem>
        <MenuItem onClick={() => handleAction("duplicate")}>Duplicate</MenuItem>
        <MenuItem onClick={() => handleAction("variant")}>
          Create variant
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleAction("archive")}>Archive</MenuItem>
      </Menu>

      <Dialog open={dialogOpen} onClose={handleDialogClose} fullWidth maxWidth="sm">
        <DialogTitle>
          {dialogMode === "edit"
            ? "Edit Patient Profile"
            : dialogMode === "variant"
            ? "Create Variant"
            : "New Patient Profile"}
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
              label="Disease / indication"
              value={draftProfile.disease}
              onChange={(event) =>
                setDraftProfile((prev) => ({
                  ...prev,
                  disease: event.target.value,
                }))
              }
            />
            <TextField
              label="Line of therapy"
              value={draftProfile.lineOfTherapy}
              onChange={(event) =>
                setDraftProfile((prev) => ({
                  ...prev,
                  lineOfTherapy: event.target.value,
                }))
              }
            />
            <FormControl>
              <InputLabel>Biomarkers</InputLabel>
              <Select
                multiple
                value={draftProfile.biomarkers}
                onChange={(event) =>
                  setDraftProfile((prev) => ({
                    ...prev,
                    biomarkers: event.target.value,
                  }))
                }
                input={<OutlinedInput label="Biomarkers" />}
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
              label="Inclusion criteria"
              value={draftProfile.inclusionSummary}
              onChange={(event) =>
                setDraftProfile((prev) => ({
                  ...prev,
                  inclusionSummary: event.target.value,
                }))
              }
              multiline
              minRows={3}
            />
            <TextField
              label="Exclusion criteria"
              value={draftProfile.exclusionSummary}
              onChange={(event) =>
                setDraftProfile((prev) => ({
                  ...prev,
                  exclusionSummary: event.target.value,
                }))
              }
              multiline
              minRows={3}
            />
            <FormControl>
              <InputLabel>Detail level</InputLabel>
              <Select
                value={draftProfile.detailLevel}
                label="Detail level"
                onChange={(event) =>
                  setDraftProfile((prev) => ({
                    ...prev,
                    detailLevel: event.target.value,
                  }))
                }
              >
                {sortableColumns.detailLevel.map((level) => (
                  <MenuItem key={level} value={level}>
                    {level}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          {dialogMode === "variant" && draftProfile.parentId ? (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 2, display: "block" }}
            >
              Variant derived from {draftProfile.parentId}
            </Typography>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button variant="contained" onClick={handleDialogSave}>
            Save Profile
          </Button>
        </DialogActions>
      </Dialog>

      <Drawer
        anchor="right"
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
      >
        <Box sx={{ width: 360, p: 3 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Compare profiles
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Read-only comparison of selected profile options.
          </Typography>
          {selectedProfiles.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Select profiles to compare.
            </Typography>
          ) : (
            selectedProfiles.map((profile) => (
              <Paper
                key={profile.id}
                variant="outlined"
                sx={{ p: 2, mb: 2 }}
              >
                <Typography variant="subtitle2">{profile.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {profile.disease} · {profile.lineOfTherapy}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2">{profile.inclusionSummary}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Exclusions: {profile.exclusionSummary}
                </Typography>
                <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 1 }}>
                  {profile.biomarkers.map((marker) => (
                    <Chip key={marker} label={marker} size="small" />
                  ))}
                </Box>
                <Divider sx={{ my: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  Creation: {profile.creationMethod}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                  Parent: {profile.parentId || "None"}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                  Last modified: {profile.lastModified}
                </Typography>
                {profile.recommendedReason ? (
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                    Reason: {profile.recommendedReason}
                  </Typography>
                ) : null}
              </Paper>
            ))
          )}
        </Box>
      </Drawer>
    </Box>
  );
};

export default PatientProfilePage;
