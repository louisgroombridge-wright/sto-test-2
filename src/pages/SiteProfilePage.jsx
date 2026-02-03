import {
  Box,
  Button,
  Checkbox,
  Chip,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  FormControl,
  InputLabel,
  LinearProgress,
  Menu,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
  Paper,
} from "@mui/material";
import { useMemo, useState } from "react";
import {
  Add,
  Delete,
  MoreVert,
  Close,
  AutoFixHigh,
} from "@mui/icons-material";

const systemCriteriaOptions = [
  "Oncology trial experience",
  "Dedicated infusion suite",
  "ePRO compliance support",
  "On-site imaging",
  "Weekend staffing",
  "Dedicated study coordinator",
];

const initialProfiles = [
  {
    id: "sp-001",
    name: "Baseline Site Gate",
    mustHaveCriteria: [
      {
        id: "c-001",
        label: "On-site imaging",
        source: "system",
      },
      {
        id: "c-002",
        label: "Dedicated study coordinator",
        source: "system",
      },
    ],
    preferredCriteria: [
      {
        id: "c-003",
        label: "Weekend staffing",
        source: "system",
      },
    ],
    systemKnownCount: 5,
    unknownCount: 2,
    avgTimeFirstPatient: 42,
    avgTimeQuarterPatients: 95,
    avgTimeThreeQuarterPatients: 160,
    avgTimeLastPatient: 210,
    addedBy: "J. Rivera",
    modifiedBy: "S. Nguyen",
    modifiedAt: "2024-05-14 09:20",
  },
  {
    id: "sp-002",
    name: "Accelerated Activation",
    mustHaveCriteria: [
      {
        id: "c-010",
        label: "Oncology trial experience",
        source: "system",
      },
      {
        id: "c-011",
        label: "Custom: capacity for Saturday infusions",
        source: "custom",
      },
    ],
    preferredCriteria: [
      {
        id: "c-012",
        label: "Dedicated infusion suite",
        source: "system",
      },
      {
        id: "c-013",
        label: "Custom: patient travel concierge",
        source: "custom",
      },
    ],
    systemKnownCount: 6,
    unknownCount: 1,
    avgTimeFirstPatient: 34,
    avgTimeQuarterPatients: 82,
    avgTimeThreeQuarterPatients: 140,
    avgTimeLastPatient: 195,
    addedBy: "L. Gomez",
    modifiedBy: "L. Gomez",
    modifiedAt: "2024-05-16 15:45",
  },
  {
    id: "sp-003",
    name: "Rescue Sites",
    mustHaveCriteria: [
      {
        id: "c-020",
        label: "ePRO compliance support",
        source: "system",
      },
    ],
    preferredCriteria: [],
    systemKnownCount: 4,
    unknownCount: 4,
    avgTimeFirstPatient: 48,
    avgTimeQuarterPatients: 110,
    avgTimeThreeQuarterPatients: 175,
    avgTimeLastPatient: 240,
    addedBy: "M. Patel",
    modifiedBy: "M. Patel",
    modifiedAt: "2024-05-18 11:10",
  },
];

const tableColumns = [
  { key: "name", label: "Name" },
  { key: "mustHaveCount", label: "Must Have Criteria" },
  { key: "preferredCount", label: "Preferred Criteria" },
  { key: "systemKnownCount", label: "System Known Criteria" },
  { key: "unknownCriteria", label: "Unknown Criteria" },
  { key: "avgTimeFirstPatient", label: "Avg. Time First Patient" },
  { key: "avgTimeQuarterPatients", label: "Avg. Time 25% Patients" },
  { key: "avgTimeThreeQuarterPatients", label: "Avg. Time 75% Patients" },
  { key: "avgTimeLastPatient", label: "Avg. Time Last Patient" },
  { key: "addedBy", label: "Added By" },
  { key: "modifiedBy", label: "Modified By" },
  { key: "actions", label: "Actions" },
];

const sortKeys = new Set([
  "mustHaveCount",
  "preferredCount",
  "systemKnownCount",
  "avgTimeFirstPatient",
  "avgTimeQuarterPatients",
  "avgTimeThreeQuarterPatients",
  "avgTimeLastPatient",
]);

const SiteProfilePage = () => {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortState, setSortState] = useState({
    key: "avgTimeFirstPatient",
    direction: "asc",
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState("create");
  const [activeProfileId, setActiveProfileId] = useState(null);
  const [drawerName, setDrawerName] = useState("");
  const [mustHaveCriteria, setMustHaveCriteria] = useState([]);
  const [preferredCriteria, setPreferredCriteria] = useState([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [customQuestion, setCustomQuestion] = useState("");
  const [customSuggestion, setCustomSuggestion] = useState(null);
  const [customTarget, setCustomTarget] = useState("mustHave");
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuProfileId, setMenuProfileId] = useState(null);

  const sortedProfiles = useMemo(() => {
    const withCounts = profiles.map((profile) => ({
      ...profile,
      mustHaveCount: profile.mustHaveCriteria.length,
      preferredCount: profile.preferredCriteria.length,
    }));

    const sorted = [...withCounts].sort((a, b) => {
      const { key, direction } = sortState;
      const multiplier = direction === "asc" ? 1 : -1;
      if (!sortKeys.has(key)) {
        return 0;
      }
      return (a[key] - b[key]) * multiplier;
    });

    return sorted;
  }, [profiles, sortState]);

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedIds(profiles.map((profile) => profile.id));
      return;
    }
    setSelectedIds([]);
  };

  const handleSelectOne = (profileId) => {
    setSelectedIds((prev) =>
      prev.includes(profileId)
        ? prev.filter((id) => id !== profileId)
        : [...prev, profileId]
    );
  };

  const handleSort = (key) => {
    if (!sortKeys.has(key)) {
      return;
    }
    setSortState((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleOpenDrawer = (mode, profile = null) => {
    setDrawerMode(mode);
    setDrawerOpen(true);
    setActiveProfileId(profile?.id ?? null);
    setDrawerName(profile?.name ?? "");
    setMustHaveCriteria(profile?.mustHaveCriteria ?? []);
    setPreferredCriteria(profile?.preferredCriteria ?? []);
    setHasUnsavedChanges(false);
  };

  const handleCloseDrawer = () => {
    if (hasUnsavedChanges) {
      const confirmClose = window.confirm(
        "Discard unsaved changes to this Site Profile?"
      );
      if (!confirmClose) {
        return;
      }
    }
    setDrawerOpen(false);
  };

  const handleMenuOpen = (event, profileId) => {
    setMenuAnchor(event.currentTarget);
    setMenuProfileId(profileId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuProfileId(null);
  };

  const handleDeleteProfiles = (profileIds) => {
    const confirmDelete = window.confirm(
      "Delete the selected Site Profile(s)? This cannot be undone."
    );
    if (!confirmDelete) {
      return;
    }
    setProfiles((prev) => prev.filter((profile) => !profileIds.includes(profile.id)));
    setSelectedIds([]);
  };

  const handleDuplicateProfile = (profileId) => {
    setProfiles((prev) => {
      const profile = prev.find((item) => item.id === profileId);
      if (!profile) {
        return prev;
      }
      const now = new Date().toISOString().slice(0, 16).replace("T", " ");
      return [
        {
          ...profile,
          id: `sp-${Math.random().toString(36).slice(2, 8)}`,
          name: `${profile.name} (Copy)`,
          modifiedBy: "Current User",
          modifiedAt: now,
          addedBy: "Current User",
        },
        ...prev,
      ];
    });
  };

  const handleDrawerSubmit = () => {
    if (!drawerName.trim() || mustHaveCriteria.length === 0) {
      return;
    }
    const now = new Date().toISOString().slice(0, 16).replace("T", " ");
    if (drawerMode === "create") {
      const newProfile = {
        id: `sp-${Math.random().toString(36).slice(2, 8)}`,
        name: drawerName,
        mustHaveCriteria,
        preferredCriteria,
        systemKnownCount:
          mustHaveCriteria.filter((item) => item.source === "system").length +
          preferredCriteria.filter((item) => item.source === "system").length,
        unknownCount:
          mustHaveCriteria.filter((item) => item.source === "custom").length +
          preferredCriteria.filter((item) => item.source === "custom").length,
        avgTimeFirstPatient: 40,
        avgTimeQuarterPatients: 90,
        avgTimeThreeQuarterPatients: 150,
        avgTimeLastPatient: 205,
        addedBy: "Current User",
        modifiedBy: "Current User",
        modifiedAt: now,
      };
      setProfiles((prev) => [newProfile, ...prev]);
    } else {
      setProfiles((prev) =>
        prev.map((profile) =>
          profile.id === activeProfileId
            ? {
                ...profile,
                name: drawerName,
                mustHaveCriteria,
                preferredCriteria,
                systemKnownCount:
                  mustHaveCriteria.filter((item) => item.source === "system")
                    .length +
                  preferredCriteria.filter((item) => item.source === "system")
                    .length,
                unknownCount:
                  mustHaveCriteria.filter((item) => item.source === "custom")
                    .length +
                  preferredCriteria.filter((item) => item.source === "custom")
                    .length,
                modifiedBy: "Current User",
                modifiedAt: now,
              }
            : profile
        )
      );
    }
    setDrawerOpen(false);
  };

  const handleCriteriaChange = (setter, value) => {
    setHasUnsavedChanges(true);
    setter(value);
  };

  const handleOpenCustomModal = (target) => {
    setCustomTarget(target);
    setCustomModalOpen(true);
    setCustomQuestion("");
    setCustomSuggestion(null);
  };

  const handleCustomFind = () => {
    if (!customQuestion.trim()) {
      return;
    }
    // Placeholder integration: simulates Deep Agent suggesting metadata.
    setCustomSuggestion({
      label: customQuestion,
      source: "custom",
      rationale: "External signals suggest this improves enrollment reliability.",
      confidence: "Medium",
    });
  };

  const handleAddCustomSuggestion = () => {
    if (!customSuggestion) {
      return;
    }
    const newCriterion = {
      id: `c-${Math.random().toString(36).slice(2, 8)}`,
      label: `Custom: ${customSuggestion.label}`,
      source: "custom",
    };
    if (customTarget === "mustHave") {
      handleCriteriaChange(setMustHaveCriteria, [...mustHaveCriteria, newCriterion]);
    } else {
      handleCriteriaChange(
        setPreferredCriteria,
        [...preferredCriteria, newCriterion]
      );
    }
    setCustomModalOpen(false);
  };

  const criteriaOptionsWithCustom = [...systemCriteriaOptions, "Custom…"];

  const renderCriteriaSelect = (label, value, setter, target) => (
    <FormControl fullWidth size="small">
      <InputLabel id={`${label}-label`}>{label}</InputLabel>
      <Select
        labelId={`${label}-label`}
        label={label}
        multiple
        value={value.map((item) => item.label)}
        onChange={(event) => {
          const selected = event.target.value;
          if (selected.includes("Custom…")) {
            handleOpenCustomModal(target);
            return;
          }
          const newCriteria = selected.map((itemLabel) => {
            const isCustom = itemLabel.startsWith("Custom:");
            return {
              id: `c-${Math.random().toString(36).slice(2, 8)}`,
              label: itemLabel,
              source: isCustom ? "custom" : "system",
            };
          });
          handleCriteriaChange(setter, newCriteria);
        }}
        renderValue={(selected) => (
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {selected.map((item) => (
              <Chip key={item} label={item} size="small" />
            ))}
          </Stack>
        )}
      >
        {criteriaOptionsWithCustom.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  return (
    <Box sx={{ p: 4 }}>
      <Stack spacing={3}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "flex-start", md: "center" }}
          justifyContent="space-between"
        >
          <Typography variant="h5">Site Profiles</Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDrawer("create")}
            >
              + Create Site Profile
            </Button>
            <Button
              variant="outlined"
              startIcon={<Delete />}
              onClick={() => handleDeleteProfiles(selectedIds)}
              disabled={selectedIds.length === 0}
            >
              Delete Site Profile
            </Button>
          </Stack>
        </Stack>

        <Paper sx={{ p: 2 }}>
          {/* Table-first layout keeps the table as the system of record. */}
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={
                        selectedIds.length === profiles.length &&
                        profiles.length > 0
                      }
                      indeterminate={
                        selectedIds.length > 0 &&
                        selectedIds.length < profiles.length
                      }
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  {tableColumns.map((column) => (
                    <TableCell key={column.key}>
                      {sortKeys.has(column.key) ? (
                        <TableSortLabel
                          active={sortState.key === column.key}
                          direction={sortState.direction}
                          onClick={() => handleSort(column.key)}
                        >
                          {column.label}
                        </TableSortLabel>
                      ) : (
                        column.label
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedProfiles.map((profile) => {
                  const totalCriteria =
                    profile.systemKnownCount + profile.unknownCount;
                  const unknownPercent =
                    totalCriteria === 0
                      ? 0
                      : Math.round((profile.unknownCount / totalCriteria) * 100);

                  return (
                    <TableRow
                      key={profile.id}
                      hover
                      selected={selectedIds.includes(profile.id)}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedIds.includes(profile.id)}
                          onChange={() => handleSelectOne(profile.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Typography variant="subtitle2">
                            {profile.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Last updated {profile.modifiedAt}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>{profile.mustHaveCriteria.length}</TableCell>
                      <TableCell>{profile.preferredCriteria.length}</TableCell>
                      <TableCell>{profile.systemKnownCount}</TableCell>
                      <TableCell sx={{ minWidth: 180 }}>
                        {/* Progress communicates known vs unknown criteria without charts. */}
                        <Stack spacing={0.5}>
                          <LinearProgress
                            variant="determinate"
                            value={100 - unknownPercent}
                            sx={{ height: 8, borderRadius: 8 }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {profile.unknownCount} unknown · {unknownPercent}%
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>{profile.avgTimeFirstPatient} days</TableCell>
                      <TableCell>{profile.avgTimeQuarterPatients} days</TableCell>
                      <TableCell>{profile.avgTimeThreeQuarterPatients} days</TableCell>
                      <TableCell>{profile.avgTimeLastPatient} days</TableCell>
                      <TableCell>{profile.addedBy}</TableCell>
                      <TableCell>{profile.modifiedBy}</TableCell>
                      <TableCell>
                        <Tooltip title="Actions">
                          <Button
                            size="small"
                            variant="text"
                            onClick={(event) => handleMenuOpen(event, profile.id)}
                            startIcon={<MoreVert />}
                          >
                            More
                          </Button>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Stack>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        <MenuItem
          onClick={() => {
            const profile = profiles.find((item) => item.id === menuProfileId);
            handleMenuClose();
            if (profile) {
              handleOpenDrawer("edit", profile);
            }
          }}
        >
          Edit Site Profile
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuProfileId) {
              handleDuplicateProfile(menuProfileId);
            }
            handleMenuClose();
          }}
        >
          Duplicate Site Profile
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuProfileId) {
              handleDeleteProfiles([menuProfileId]);
            }
            handleMenuClose();
          }}
        >
          Delete Site Profile
        </MenuItem>
      </Menu>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleCloseDrawer}
        PaperProps={{ sx: { width: { xs: "100%", md: "38%" }, p: 3 } }}
      >
        <Stack spacing={2} sx={{ height: "100%" }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h6">
              {drawerMode === "create" ? "Create Site Profile" : "Edit Site Profile"}
            </Typography>
            <Button onClick={handleCloseDrawer} startIcon={<Close />}>
              Close
            </Button>
          </Stack>
          <Divider />
          <Stack spacing={2} sx={{ flex: 1 }}>
            {/* Drawer is a workspace for explicit criteria construction. */}
            <TextField
              label="Name"
              required
              value={drawerName}
              onChange={(event) => {
                setDrawerName(event.target.value);
                setHasUnsavedChanges(true);
              }}
              helperText="Required for traceability across scenarios."
            />
            {renderCriteriaSelect(
              "Must Have Criteria",
              mustHaveCriteria,
              setMustHaveCriteria,
              "mustHave"
            )}
            <Typography variant="caption" color="text.secondary">
              Must-have criteria are enforced across downstream feasibility steps.
            </Typography>
            {renderCriteriaSelect(
              "Preferred Criteria (optional)",
              preferredCriteria,
              setPreferredCriteria,
              "preferred"
            )}
            <Collapse in>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: "action.hover",
                }}
              >
                <Typography variant="subtitle2">Traceability</Typography>
                <Typography variant="body2" color="text.secondary">
                  System-known vs custom criterion sources are preserved for audit
                  views. This summary updates on submit to protect data lineage.
                </Typography>
              </Box>
            </Collapse>
          </Stack>
          <Divider />
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button onClick={handleCloseDrawer}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleDrawerSubmit}
              disabled={!drawerName.trim() || mustHaveCriteria.length === 0}
            >
              Submit
            </Button>
          </Stack>
        </Stack>
      </Drawer>

      <Dialog
        open={customModalOpen}
        onClose={() => setCustomModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Custom criterion</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Question"
              value={customQuestion}
              onChange={(event) => setCustomQuestion(event.target.value)}
              placeholder="Describe the criterion you want to define"
              fullWidth
            />
            <Collapse in={Boolean(customSuggestion)}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  backgroundColor: "background.default",
                }}
              >
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <AutoFixHigh fontSize="small" color="primary" />
                    <Typography variant="subtitle2">
                      Deep Agent suggestion
                    </Typography>
                  </Stack>
                  <Typography variant="body2">
                    {customSuggestion?.rationale}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip label={`Confidence: ${customSuggestion?.confidence}`} size="small" />
                    <Chip label="Source: Custom" size="small" variant="outlined" />
                  </Stack>
                  <Button
                    variant="outlined"
                    onClick={handleAddCustomSuggestion}
                  >
                    Confirm & add criterion
                  </Button>
                </Stack>
              </Box>
            </Collapse>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCustomModalOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCustomFind}
            disabled={!customQuestion.trim()}
          >
            Find with Deep Agent
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SiteProfilePage;
