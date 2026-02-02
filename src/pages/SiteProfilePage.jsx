import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
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
  Checkbox,
} from "@mui/material";
import { Fragment, useMemo, useState } from "react";
import {
  Add,
  ContentCopy,
  Edit,
  ExpandMore,
  Lock,
  LockOpen,
  Restore,
  Archive,
} from "@mui/icons-material";

const baselineProfile = {
  id: "sp-001",
  name: "Baseline Site Gate",
  description:
    "Rules of engagement for sites eligible in this scenario.",
  status: "Draft",
  lastModified: "2024-04-14 09:30",
  modifiedBy: "J. Rivera",
  downstreamStatus: "Up to date",
  criteria: [
    {
      id: "sc-001",
      category: "Equipment",
      label: "On-site CT scanner with contrast protocol",
      requirement: "Required",
      source: "Data-derived",
      notes: "Required for imaging schedule within 7 days.",
      impact: "Moderate",
      createdBy: "J. Rivera",
      createdAt: "2024-04-10 08:30",
      updatedBy: "J. Rivera",
      updatedAt: "2024-04-12 16:05",
      archived: false,
    },
    {
      id: "sc-002",
      category: "Experience",
      label: "Prior Phase II oncology trials in last 24 months",
      requirement: "Required",
      source: "Qualification required",
      notes: "Ensures experienced coordination team.",
      impact: "High",
      createdBy: "S. Nguyen",
      createdAt: "2024-04-11 11:40",
      updatedBy: "S. Nguyen",
      updatedAt: "2024-04-11 11:40",
      archived: false,
    },
    {
      id: "sc-003",
      category: "Facility",
      label: "Dedicated infusion suite with 8+ chairs",
      requirement: "Preferred",
      source: "Expert judgement",
      notes: "Improves throughput but not mandatory.",
      impact: "Low",
      createdBy: "M. Patel",
      createdAt: "2024-04-12 09:05",
      updatedBy: "M. Patel",
      updatedAt: "2024-04-12 09:05",
      archived: false,
    },
    {
      id: "sc-004",
      category: "Operations",
      label: "Ability to support ePRO with weekly reminders",
      requirement: "Preferred",
      source: "Data-derived",
      notes: "Supports compliance for digital outcomes.",
      impact: "Low",
      createdBy: "L. Gomez",
      createdAt: "2024-04-12 13:10",
      updatedBy: "L. Gomez",
      updatedAt: "2024-04-12 13:10",
      archived: false,
    },
  ],
};

const emptyCriterion = {
  id: "",
  category: "Equipment",
  label: "",
  requirement: "Required",
  source: "Data-derived",
  notes: "",
  impact: "Low",
  createdBy: "",
  createdAt: "",
  updatedBy: "",
  updatedAt: "",
  archived: false,
};

const categories = ["Equipment", "Experience", "Facility", "Operations"];
const sources = [
  "Data-derived",
  "Expert judgement",
  "Qualification required",
];
const impactOrder = {
  Low: 6,
  Moderate: 10,
  High: 18,
};

const requirementMultiplier = {
  Required: 1,
  Preferred: 0.5,
};

const formatTimestamp = () => {
  const now = new Date();
  return now.toISOString().slice(0, 16).replace("T", " ");
};

const SiteProfilePage = () => {
  const [profile, setProfile] = useState(baselineProfile);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("add");
  const [draftCriterion, setDraftCriterion] = useState(emptyCriterion);
  const [profileName, setProfileName] = useState(baselineProfile.name);
  const [profileDescription, setProfileDescription] = useState(
    baselineProfile.description
  );

  // Criteria shown here are the explicit eligibility gates for downstream steps.
  const activeCriteria = useMemo(
    () => profile.criteria.filter((criterion) => !criterion.archived),
    [profile.criteria]
  );

  const requiredCount = useMemo(
    () => activeCriteria.filter((criterion) => criterion.requirement === "Required")
      .length,
    [activeCriteria]
  );

  const preferredCount = useMemo(
    () => activeCriteria.filter((criterion) => criterion.requirement === "Preferred")
      .length,
    [activeCriteria]
  );

  // Directional impact estimate only; does not list or rank actual sites.
  const estimatedBaseline = 240;
  const estimatedRemaining = Math.max(
    20,
    Math.round(
      estimatedBaseline -
        activeCriteria.reduce(
          (accumulator, criterion) =>
            accumulator +
            impactOrder[criterion.impact] *
              requirementMultiplier[criterion.requirement],
          0
        )
    )
  );

  const isLocked = profile.status === "Locked";
  const isMissingRequired = requiredCount === 0;
  const isOverlyRestrictive = estimatedRemaining < 60 || requiredCount > 4;
  const isDownstreamOutOfDate = profile.downstreamStatus === "Out of date";

  // Editing is blocked when a profile is locked; users must duplicate first.
  const handleOpenDialog = (mode, criterion = emptyCriterion) => {
    if (isLocked) {
      return;
    }
    setDialogMode(mode);
    setDraftCriterion(criterion);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setDraftCriterion(emptyCriterion);
  };

  const handleSaveCriterion = () => {
    const now = formatTimestamp();
    if (dialogMode === "add") {
      const newCriterion = {
        ...draftCriterion,
        id: `sc-${Math.random().toString(36).slice(2, 8)}`,
        createdBy: "Current User",
        createdAt: now,
        updatedBy: "Current User",
        updatedAt: now,
        archived: false,
      };
      setProfile((prev) => ({
        ...prev,
        criteria: [...prev.criteria, newCriterion],
        lastModified: now,
        modifiedBy: "Current User",
        downstreamStatus: "Out of date",
      }));
    } else {
      setProfile((prev) => ({
        ...prev,
        criteria: prev.criteria.map((criterion) =>
          criterion.id === draftCriterion.id
            ? {
                ...draftCriterion,
                updatedBy: "Current User",
                updatedAt: now,
              }
            : criterion
        ),
        lastModified: now,
        modifiedBy: "Current User",
        downstreamStatus: "Out of date",
      }));
    }
    handleCloseDialog();
  };

  const handleToggleRequirement = (criterionId) => {
    if (isLocked) {
      return;
    }
    const now = formatTimestamp();
    setProfile((prev) => ({
      ...prev,
      criteria: prev.criteria.map((criterion) =>
        criterion.id === criterionId
          ? {
              ...criterion,
              requirement:
                criterion.requirement === "Required" ? "Preferred" : "Required",
              updatedBy: "Current User",
              updatedAt: now,
            }
          : criterion
      ),
      lastModified: now,
      modifiedBy: "Current User",
      downstreamStatus: "Out of date",
    }));
  };

  const handleUpdateCriterionField = (criterionId, field, value) => {
    if (isLocked) {
      return;
    }
    const now = formatTimestamp();
    setProfile((prev) => ({
      ...prev,
      criteria: prev.criteria.map((criterion) =>
        criterion.id === criterionId
          ? {
              ...criterion,
              [field]: value,
              updatedBy: "Current User",
              updatedAt: now,
            }
          : criterion
      ),
      lastModified: now,
      modifiedBy: "Current User",
      downstreamStatus: "Out of date",
    }));
  };

  // Archive instead of deleting to preserve auditability.
  const handleArchiveCriterion = (criterionId) => {
    if (isLocked) {
      return;
    }
    const now = formatTimestamp();
    setProfile((prev) => ({
      ...prev,
      criteria: prev.criteria.map((criterion) =>
        criterion.id === criterionId
          ? {
              ...criterion,
              archived: true,
              updatedBy: "Current User",
              updatedAt: now,
            }
          : criterion
      ),
      lastModified: now,
      modifiedBy: "Current User",
      downstreamStatus: "Out of date",
    }));
  };

  const handleDuplicateProfile = () => {
    const now = formatTimestamp();
    setProfile((prev) => ({
      ...prev,
      id: `sp-${Math.random().toString(36).slice(2, 8)}`,
      status: "Draft",
      name: `${prev.name} (Copy)`,
      lastModified: now,
      modifiedBy: "Current User",
      downstreamStatus: "Out of date",
    }));
    setProfileName((prev) => `${prev} (Copy)`);
    setProfileDescription((prev) => `${prev} (Copy)`);
  };

  const handleResetBaseline = () => {
    setProfile(baselineProfile);
    setProfileName(baselineProfile.name);
    setProfileDescription(baselineProfile.description);
  };

  const handleToggleLock = () => {
    if (profile.status === "Locked") {
      return;
    }
    setProfile((prev) => ({
      ...prev,
      status: "Locked",
    }));
  };

  const handleUpdateProfileName = (event) => {
    setProfileName(event.target.value);
  };

  const handleBlurProfileName = () => {
    if (!profileName.trim()) {
      setProfileName(profile.name);
      return;
    }
    if (profileName !== profile.name) {
      const now = formatTimestamp();
      setProfile((prev) => ({
        ...prev,
        name: profileName,
        lastModified: now,
        modifiedBy: "Current User",
      }));
    }
  };

  const handleUpdateDescription = (event) => {
    setProfileDescription(event.target.value);
  };

  const handleBlurDescription = () => {
    if (profileDescription !== profile.description) {
      const now = formatTimestamp();
      setProfile((prev) => ({
        ...prev,
        description: profileDescription,
        lastModified: now,
        modifiedBy: "Current User",
      }));
    }
  };

  const groupedCriteria = useMemo(
    () =>
      categories.map((category) => ({
        category,
        items: activeCriteria.filter(
          (criterion) => criterion.category === category
        ),
      })),
    [activeCriteria]
  );

  return (
    <Box sx={{ p: 4 }}>
      <Stack spacing={3}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 2,
            justifyContent: "space-between",
          }}
        >
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog("add")}
              disabled={isLocked}
            >
              Add Criterion
            </Button>
            <Button
              variant="outlined"
              startIcon={<ContentCopy />}
              onClick={handleDuplicateProfile}
            >
              Duplicate Profile
            </Button>
            <Button
              variant="text"
              startIcon={<Restore />}
              onClick={handleResetBaseline}
              disabled={isLocked}
            >
              Reset to baseline
            </Button>
            <Tooltip
              title={
                isLocked
                  ? "Locked profiles cannot be edited. Duplicate to make changes."
                  : "Lock this profile to prevent edits."
              }
            >
              <span>
                <Button
                  variant="text"
                  startIcon={isLocked ? <Lock /> : <LockOpen />}
                  onClick={handleToggleLock}
                  disabled={isLocked}
                >
                  {isLocked ? "Locked" : "Lock Profile"}
                </Button>
              </span>
            </Tooltip>
          </Stack>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              label="Profile name"
              size="small"
              value={profileName}
              onChange={handleUpdateProfileName}
              onBlur={handleBlurProfileName}
              disabled={isLocked}
              sx={{ minWidth: 240 }}
            />
            <TextField
              label="Description (optional)"
              size="small"
              value={profileDescription}
              onChange={handleUpdateDescription}
              onBlur={handleBlurDescription}
              disabled={isLocked}
              sx={{ minWidth: 280 }}
            />
            <Chip
              label={profile.status}
              color={profile.status === "Locked" ? "default" : "primary"}
              variant={profile.status === "Locked" ? "outlined" : "filled"}
            />
          </Stack>
        </Box>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Last modified: {profile.lastModified} · {profile.modifiedBy}
          </Typography>
          <Typography
            variant="body2"
            color={isDownstreamOutOfDate ? "warning.main" : "text.secondary"}
          >
            Downstream status: {profile.downstreamStatus}
          </Typography>
        </Stack>

        <Paper sx={{ p: 2 }}>
          <Stack spacing={1}>
            <Typography variant="h6">Site selection criteria</Typography>
            <Typography variant="body2" color="text.secondary">
              Define explicit eligibility gates for this scenario. Changes here
              invalidate downstream country modeling and site recommendations.
            </Typography>
            <Divider />
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Category</TableCell>
                    <TableCell>Criterion</TableCell>
                    <TableCell>Requirement</TableCell>
                    <TableCell>Source</TableCell>
                    <TableCell>Notes</TableCell>
                    <TableCell>Population excluded (approx.)</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* Constraint: grouping is visual only; no ordering or ranking implied. */}
                  {groupedCriteria.map((group) => (
                    <Fragment key={group.category}>
                      {group.items.length > 0 && (
                        <TableRow
                          key={`${group.category}-header`}
                          sx={{ backgroundColor: "action.hover" }}
                        >
                          <TableCell colSpan={7}>
                            <Typography variant="subtitle2">
                              {group.category}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                      {group.items.map((criterion) => (
                        <TableRow key={criterion.id}>
                          <TableCell>{criterion.category}</TableCell>
                          <TableCell>
                            <Stack spacing={0.5}>
                              <Typography variant="body2">
                                {criterion.label}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Created by {criterion.createdBy} on{" "}
                                {criterion.createdAt}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Checkbox
                                checked={criterion.requirement === "Required"}
                                onChange={() =>
                                  handleToggleRequirement(criterion.id)
                                }
                                disabled={isLocked}
                              />
                              <Typography variant="body2">
                                {criterion.requirement}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <FormControl size="small" fullWidth>
                              <Select
                                value={criterion.source}
                                onChange={(event) =>
                                  handleUpdateCriterionField(
                                    criterion.id,
                                    "source",
                                    event.target.value
                                  )
                                }
                                disabled={isLocked}
                              >
                                {sources.map((source) => (
                                  <MenuItem key={source} value={source}>
                                    {source}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </TableCell>
                          <TableCell>
                            <Tooltip
                              title={`Updated by ${criterion.updatedBy} on ${criterion.updatedAt}`}
                            >
                              <Typography variant="body2">
                                {criterion.notes || "Add rationale in the edit dialog."}
                              </Typography>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            {Math.round(
                              impactOrder[criterion.impact] *
                                requirementMultiplier[criterion.requirement]
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <Stack
                              direction="row"
                              spacing={1}
                              justifyContent="flex-end"
                            >
                              <Tooltip
                                title={
                                  isLocked
                                    ? "Duplicate the profile to edit criteria."
                                    : "Edit criterion"
                                }
                              >
                                <span>
                                  <Button
                                    size="small"
                                    startIcon={<Edit />}
                                    onClick={() =>
                                      handleOpenDialog("edit", criterion)
                                    }
                                    disabled={isLocked}
                                  >
                                    Edit
                                  </Button>
                                </span>
                              </Tooltip>
                              <Tooltip
                                title={
                                  isLocked
                                    ? "Duplicate the profile to archive."
                                    : "Archive instead of deleting."
                                }
                              >
                                <span>
                                  <Button
                                    size="small"
                                    color="warning"
                                    startIcon={<Archive />}
                                    onClick={() =>
                                      handleArchiveCriterion(criterion.id)
                                    }
                                    disabled={isLocked}
                                  >
                                    Archive
                                  </Button>
                                </span>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Typography variant="h6">Impact summary</Typography>
            {/* Constraint: impact is approximate only; no site lists or rankings. */}
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Approximate candidate sites (baseline)
                </Typography>
                <Typography variant="h4">{estimatedBaseline}</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Approximate remaining after criteria
                </Typography>
                <Typography variant="h4">{estimatedRemaining}</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Required vs preferred criteria
                </Typography>
                <Typography variant="h5">
                  {requiredCount} Required · {preferredCount} Preferred
                </Typography>
              </Box>
            </Stack>
            {isMissingRequired && (
              <Typography color="error" variant="body2">
                At least one Required criterion must be defined before proceeding.
              </Typography>
            )}
            {isOverlyRestrictive && (
              <Typography color="warning.main" variant="body2">
                Warning: Remaining sites are below the minimum threshold or too
                many Required criteria exist.
              </Typography>
            )}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>Impact signals & downstream effects</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    {isOverlyRestrictive
                      ? "Warning: Criteria set may be overly restrictive. Consider downgrading some requirements to Preferred."
                      : "Criteria strictness looks balanced for exploratory modeling."}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Any change to criteria invalidates country modeling and site
                    recommendations. Users must re-run downstream steps after
                    saving updates.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Last modified: {profile.lastModified} · {profile.modifiedBy}
                  </Typography>
                </Stack>
              </AccordionDetails>
            </Accordion>
          </Stack>
        </Paper>
      </Stack>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === "add" ? "Add criterion" : "Edit criterion"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                label="Category"
                value={draftCriterion.category}
                onChange={(event) =>
                  setDraftCriterion((prev) => ({
                    ...prev,
                    category: event.target.value,
                  }))
                }
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Criterion"
              value={draftCriterion.label}
              onChange={(event) =>
                setDraftCriterion((prev) => ({
                  ...prev,
                  label: event.target.value,
                }))
              }
              helperText="Template suggestions are optional; be explicit."
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel id="requirement-label">Requirement type</InputLabel>
              <Select
                labelId="requirement-label"
                label="Requirement type"
                value={draftCriterion.requirement}
                onChange={(event) =>
                  setDraftCriterion((prev) => ({
                    ...prev,
                    requirement: event.target.value,
                  }))
                }
              >
                {["Required", "Preferred"].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="source-label">Source</InputLabel>
              <Select
                labelId="source-label"
                label="Source"
                value={draftCriterion.source}
                onChange={(event) =>
                  setDraftCriterion((prev) => ({
                    ...prev,
                    source: event.target.value,
                  }))
                }
              >
                {sources.map((source) => (
                  <MenuItem key={source} value={source}>
                    {source}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Notes"
              value={draftCriterion.notes}
              onChange={(event) =>
                setDraftCriterion((prev) => ({
                  ...prev,
                  notes: event.target.value,
                }))
              }
              placeholder="Explain why this is important"
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              label="Traceability"
              value={
                dialogMode === "add"
                  ? "Will be stamped on save"
                  : `Created by ${draftCriterion.createdBy} on ${draftCriterion.createdAt}`
              }
              InputProps={{ readOnly: true }}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveCriterion}
            disabled={!draftCriterion.label.trim()}
          >
            Save criterion
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SiteProfilePage;
