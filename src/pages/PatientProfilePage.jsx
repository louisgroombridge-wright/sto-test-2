import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  Grid,
  Icon,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Tab,
  Tabs,
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
import {
  Add,
  ArrowDownward,
  ArrowUpward,
  Close,
  DeleteOutline,
  ExpandLess,
  ExpandMore,
  MoreVert,
  Remove,
  UploadFile,
} from "@mui/icons-material";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";

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
    benchmarkStudies: ["LUX-Lung 3", "KEYNOTE-189"],
    source: "Manual",
    addedBy: "Dr. K. Patel",
    modifiedBy: "E. Garner",
    inclusionCriteria: [
      "Stage IV",
      "ECOG 0-1",
      "No prior systemic therapy",
    ],
    exclusionCriteria: ["Active CNS metastases", "Prior EGFR TKIs"],
    criteriaTimeline: [
      {
        criterion: "Stage IV",
        value: "Required",
        impactPercent: 6,
        direction: "up",
      },
      {
        criterion: "ECOG 0-1",
        value: "Strict",
        impactPercent: -8,
        direction: "down",
      },
      {
        criterion: "No prior systemic therapy",
        value: "Directional",
        impactPercent: 3,
        direction: "up",
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
    benchmarkStudies: ["FLAURA", "LUX-Lung 7"],
    source: "Imported",
    addedBy: "M. Chen",
    modifiedBy: "M. Chen",
    inclusionCriteria: ["EGFR exon 19/21", "No prior TKI"],
    exclusionCriteria: ["EGFR exon 20 insertion"],
    criteriaTimeline: [
      {
        criterion: "EGFR exon 19/21",
        value: "Required",
        impactPercent: 4,
        direction: "up",
      },
      {
        criterion: "No prior TKI",
        value: "Directional",
        impactPercent: -5,
        direction: "down",
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
    benchmarkStudies: ["KEYNOTE-010", "CheckMate 057"],
    source: "Recommended",
    addedBy: "S. Ivanov",
    modifiedBy: "S. Ivanov",
    inclusionCriteria: ["PD-L1 ≥50%", "Post chemo-IO"],
    exclusionCriteria: ["Prior PD-1/PD-L1 combo"],
    criteriaTimeline: [
      {
        criterion: "PD-L1 ≥50%",
        value: "Required",
        impactPercent: 5,
        direction: "up",
      },
      {
        criterion: "Post chemo-IO",
        value: "Directional",
        impactPercent: 0,
        direction: "flat",
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
  benchmarkStudies: [],
  source: "Manual",
  addedBy: "",
  modifiedBy: "",
  inclusionCriteria: [],
  exclusionCriteria: [],
  biomarkers: [],
};

const placeholderSuggestions = {
  inclusion: [
    "ECOG 0-1",
    "No prior systemic therapy",
    "Age ≥ 18",
  ],
  exclusion: [
    "Active CNS metastases",
    "Concurrent investigational agents",
  ],
};

const PatientProfilePage = ({
  reviewItems = {},
  onStartReview = () => {},
  onMarkReviewed = () => {},
  onAcknowledgeComment = () => {},
}) => {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [expandedId, setExpandedId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [actionAnchor, setActionAnchor] = useState(null);
  const [actionProfileId, setActionProfileId] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState("create");
  const [draftProfile, setDraftProfile] = useState(emptyDraft);
  const [drawerTouched, setDrawerTouched] = useState(false);
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);
  const [newBenchmark, setNewBenchmark] = useState("");
  const [newInclusion, setNewInclusion] = useState("");
  const [newExclusion, setNewExclusion] = useState("");
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareTarget, setShareTarget] = useState(null);
  const [expandedReviewId, setExpandedReviewId] = useState(null);
  const [suggestForm, setSuggestForm] = useState({
    studyTitle: "",
    indication: "",
    description: "",
  });
  const [suggestions, setSuggestions] = useState({ inclusion: [], exclusion: [] });
  const fileInputRef = useRef(null);
  const initialDraftRef = useRef(emptyDraft);

  const getReviewItem = (profileId) =>
    reviewItems[profileId] || {
      status: "Draft",
      comments: [],
      history: [],
      participants: [],
      reviewStartAt: "",
      reviewEndAt: "",
    };

  const selectedProfiles = useMemo(
    () => profiles.filter((profile) => selectedIds.includes(profile.id)),
    [profiles, selectedIds]
  );

  const shareLink = useMemo(() => {
    if (typeof window === "undefined" || !shareTarget) {
      return "";
    }
    return `${window.location.origin}${window.location.pathname}?review=${shareTarget.id}`;
  }, [shareTarget]);

  const getLastCommentDate = (comments) =>
    comments.length > 0 ? sortCommentsByDate(comments)[0].createdAt : "—";

  useEffect(() => {
    setSelectedIds((prev) => Array.from(new Set(prev)));
  }, []);

  const isSaveDisabled = !draftProfile.name.trim() || !draftProfile.indication.trim();

  const isDraftDirty = useMemo(() => {
    if (!drawerTouched) {
      return false;
    }
    return JSON.stringify(draftProfile) !== JSON.stringify(initialDraftRef.current);
  }, [drawerTouched, draftProfile]);

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

  const openDrawer = (mode, profile = emptyDraft) => {
    setDrawerMode(mode);
    setDraftProfile(profile);
    initialDraftRef.current = profile;
    setDrawerTouched(false);
    setDrawerOpen(true);
  };

  const requestCloseDrawer = () => {
    if (isDraftDirty) {
      setDiscardConfirmOpen(true);
      return;
    }
    setDrawerOpen(false);
  };

  const handleDiscardChanges = () => {
    setDiscardConfirmOpen(false);
    setDrawerOpen(false);
  };

  const handleSaveProfile = () => {
    if (isSaveDisabled) {
      return;
    }

    if (drawerMode === "edit") {
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
        totalPatients: draftProfile.totalPatients || "—",
        patientsPerCriteria: draftProfile.patientsPerCriteria || "—",
        sampleSize: draftProfile.sampleSize || "—",
        benchmarkStudies: draftProfile.benchmarkStudies || [],
        source: draftProfile.source || "Manual",
        addedBy: draftProfile.addedBy || "You",
        modifiedBy: draftProfile.modifiedBy || "You",
        criteriaTimeline: [],
        kpis: [],
        referenceStudies: [],
      };
      setProfiles((prev) => [newProfile, ...prev]);
    }

    setDrawerOpen(false);
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
      openDrawer("edit", profile);
    }

    if (action === "duplicate") {
      openDrawer("duplicate", {
        ...profile,
        id: "",
        name: `${profile.name} (Copy)`,
        source: "Manual",
        addedBy: "You",
        modifiedBy: "You",
      });
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

  const handleRemoveFromReview = (profileId) => {
    setSelectedIds((prev) => prev.filter((id) => id !== profileId));
  };

  const handleToggleReviewRow = (profileId) => {
    setExpandedReviewId((prev) => (prev === profileId ? null : profileId));
  };

  const sortCommentsByDate = (comments) =>
    [...comments].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  const handleDraftChange = (field, value) => {
    setDrawerTouched(true);
    setDraftProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddBenchmark = () => {
    const trimmed = newBenchmark.trim();
    if (!trimmed) {
      return;
    }
    handleDraftChange("benchmarkStudies", [
      ...(draftProfile.benchmarkStudies || []),
      trimmed,
    ]);
    setNewBenchmark("");
  };

  const handleRemoveBenchmark = (study) => {
    handleDraftChange(
      "benchmarkStudies",
      draftProfile.benchmarkStudies.filter((item) => item !== study)
    );
  };

  const handleAddCriterion = (type) => {
    const value = type === "inclusion" ? newInclusion : newExclusion;
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }
    const field = type === "inclusion" ? "inclusionCriteria" : "exclusionCriteria";
    handleDraftChange(field, [...(draftProfile[field] || []), trimmed]);
    if (type === "inclusion") {
      setNewInclusion("");
    } else {
      setNewExclusion("");
    }
  };

  const handleRemoveCriterion = (type, value) => {
    const field = type === "inclusion" ? "inclusionCriteria" : "exclusionCriteria";
    handleDraftChange(
      field,
      draftProfile[field].filter((item) => item !== value)
    );
  };

  const handleOpenSuggest = () => {
    setSuggestOpen(true);
    setSuggestions({ inclusion: [], exclusion: [] });
    setSuggestForm((prev) => ({
      ...prev,
      indication: prev.indication || draftProfile.indication,
    }));
  };

  const handleGenerateSuggestions = () => {
    setSuggestions(placeholderSuggestions);
  };

  const handleAcceptSuggestion = (type, value) => {
    const field = type === "inclusion" ? "inclusionCriteria" : "exclusionCriteria";
    handleDraftChange(field, [...(draftProfile[field] || []), value]);
    setSuggestions((prev) => ({
      ...prev,
      [type]: prev[type].filter((item) => item !== value),
    }));
  };

  const handleRejectSuggestion = (type, value) => {
    setSuggestions((prev) => ({
      ...prev,
      [type]: prev[type].filter((item) => item !== value),
    }));
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    // Placeholder: parse document and populate profile fields.
    handleDraftChange("name", draftProfile.name || "Imported Profile");
    handleDraftChange("indication", draftProfile.indication || "Imported indication");
    handleDraftChange("inclusionCriteria", [
      ...(draftProfile.inclusionCriteria || []),
      "Imported inclusion criterion",
    ]);
    handleDraftChange("exclusionCriteria", [
      ...(draftProfile.exclusionCriteria || []),
      "Imported exclusion criterion",
    ]);
    event.target.value = "";
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
            onClick={() => openDrawer("create", emptyDraft)}
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

      <Tabs
        value={activeTab}
        onChange={(_, value) => setActiveTab(value)}
        sx={{ mb: 2 }}
      >
        <Tab label="Workspace" />
        <Tab label="Stakeholder Review" />
      </Tabs>

      {activeTab === 0 ? (
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
                const reviewItem = getReviewItem(profile.id);
                return (
                  <Fragment key={profile.id}>
                    <TableRow
                      hover
                      selected={selectedIds.includes(profile.id)}
                      onClick={() => handleRowExpand(profile.id)}
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography variant="subtitle2">{profile.name}</Typography>
                          <Chip
                            size="small"
                            label={reviewItem.status || "Draft"}
                            variant="outlined"
                          />
                        </Box>
                      </TableCell>
                      <TableCell>{profile.indication}</TableCell>
                      <TableCell>{profile.totalPatients}</TableCell>
                      <TableCell>{profile.patientsPerCriteria}</TableCell>
                      <TableCell>{profile.sampleSize}</TableCell>
                      <TableCell>{profile.benchmarkStudies.length}</TableCell>
                      <TableCell>{profile.source}</TableCell>
                      <TableCell>{profile.addedBy}</TableCell>
                      <TableCell>{profile.modifiedBy}</TableCell>
                      <TableCell align="right" onClick={(event) => event.stopPropagation()}>
                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                          <Tooltip title="Add to review">
                            <span>
                              <Checkbox
                                size="small"
                                checked={selectedIds.includes(profile.id)}
                                onChange={() => handleSelectRow(profile.id)}
                              />
                            </span>
                          </Tooltip>
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
                              Criteria impact (row-scoped)
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              Impacts shown are directional estimates relative to the baseline patient profile.
                            </Typography>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Criterion</TableCell>
                                  <TableCell>Value</TableCell>
                                  <TableCell>Impact on Patients / Month (%)</TableCell>
                                  <TableCell>Direction</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {profile.criteriaTimeline.map((row) => (
                                  <TableRow key={row.criterion}>
                                    <TableCell>{row.criterion}</TableCell>
                                    <TableCell>{row.value}</TableCell>
                                    <TableCell>
                                      {row.impactPercent > 0
                                        ? `+${row.impactPercent}%`
                                        : row.impactPercent < 0
                                        ? `${row.impactPercent}%`
                                        : "0%"}
                                    </TableCell>
                                    <TableCell>
                                      {/* Impacts are directional only; icons avoid implying precision or ranking. */}
                                      {row.direction === "up" ? (
                                        <Icon fontSize="small" component={ArrowUpward} />
                                      ) : row.direction === "down" ? (
                                        <Icon fontSize="small" component={ArrowDownward} />
                                      ) : (
                                        <Icon fontSize="small" component={Remove} />
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                                {profile.criteriaTimeline.length === 0 ? (
                                  <TableRow>
                                    <TableCell colSpan={4}>
                                      <Typography variant="body2" color="text.secondary">
                                        No criteria impact estimates captured yet.
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
      ) : (
        <Paper variant="outlined" sx={{ p: 2 }}>
          {/* Governance intent: review is read-only, feedback stays traceable. */}
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle1">Stakeholder Review</Typography>
              <Typography variant="body2" color="text.secondary">
                Review patient profiles with stakeholders to align assumptions before
                downstream feasibility steps.
              </Typography>
            </Box>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>Name</TableCell>
                  <TableCell>Review Status</TableCell>
                  <TableCell>Comment Count</TableCell>
                  <TableCell>Last Comment Date</TableCell>
                  <TableCell>Last Modified By</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedProfiles.map((profile) => {
                  const reviewItem = getReviewItem(profile.id);
                  const comments = reviewItem.comments || [];
                  const hasBlocking = comments.some(
                    (comment) => comment.blocking && !comment.acknowledged
                  );
                  const isExpanded = expandedReviewId === profile.id;
                  const sortedComments = sortCommentsByDate(comments);
                  return (
                    <Fragment key={profile.id}>
                      <TableRow hover>
                        <TableCell padding="checkbox">
                          <IconButton
                            size="small"
                            onClick={() => handleToggleReviewRow(profile.id)}
                          >
                            {isExpanded ? <ExpandLess /> : <ExpandMore />}
                          </IconButton>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2">{profile.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {profile.indication}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip size="small" label={reviewItem.status} variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={`${comments.length} comments`}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{getLastCommentDate(comments)}</TableCell>
                        <TableCell>{profile.modifiedBy}</TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => onStartReview(profile.id)}
                              disabled={reviewItem.status !== "Draft"}
                            >
                              Start Review
                            </Button>
                            <Tooltip
                              title={
                                hasBlocking
                                  ? "Acknowledge blocking concerns before marking reviewed."
                                  : ""
                              }
                            >
                              <span>
                                <Button
                                  variant="contained"
                                  size="small"
                                  onClick={() => onMarkReviewed(profile.id)}
                                  disabled={reviewItem.status !== "Under Review" || hasBlocking}
                                >
                                  Mark Reviewed
                                </Button>
                              </span>
                            </Tooltip>
                            {hasBlocking ? (
                              <Button
                                variant="text"
                                size="small"
                                onClick={() =>
                                  comments
                                    .filter((comment) => comment.blocking && !comment.acknowledged)
                                    .forEach((comment) =>
                                      onAcknowledgeComment(profile.id, comment.id)
                                    )
                                }
                              >
                                Acknowledge blocking
                              </Button>
                            ) : null}
                            <Button
                              variant="text"
                              size="small"
                              onClick={() => {
                                setShareTarget(profile);
                                setShareDialogOpen(true);
                              }}
                            >
                              Share for review
                            </Button>
                            <Button
                              variant="text"
                              size="small"
                              onClick={() =>
                                openDrawer("duplicate", {
                                  ...profile,
                                  id: "",
                                  name: `${profile.name} (Copy)`,
                                  source: "Manual",
                                  addedBy: "You",
                                  modifiedBy: "You",
                                })
                              }
                            >
                              Duplicate for edits
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleRemoveFromReview(profile.id)}
                            >
                              Remove
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={7} sx={{ p: 0, borderBottom: 0 }}>
                          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                            {/* Feedback is read-only here; comments originate from shared review links. */}
                            <Box sx={{ p: 2, backgroundColor: "action.hover" }}>
                              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Stakeholder comment overview
                              </Typography>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Tag</TableCell>
                                    <TableCell>Comment</TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Added Date</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {sortedComments.length === 0 ? (
                                    <TableRow>
                                      <TableCell colSpan={4}>
                                        <Typography variant="body2" color="text.secondary">
                                          No stakeholder comments received yet.
                                        </Typography>
                                      </TableCell>
                                    </TableRow>
                                  ) : (
                                    sortedComments.map((comment) => (
                                      <TableRow key={comment.id}>
                                        <TableCell>
                                          <Stack direction="row" spacing={1} alignItems="center">
                                            <Chip size="small" label={comment.tag || "FYI"} />
                                            {comment.blocking ? (
                                              <Icon
                                                fontSize="small"
                                                color="disabled"
                                                component={Remove}
                                              />
                                            ) : null}
                                          </Stack>
                                        </TableCell>
                                        <TableCell sx={{ whiteSpace: "normal" }}>
                                          {comment.text}
                                        </TableCell>
                                        <TableCell>{comment.author}</TableCell>
                                        <TableCell>{comment.createdAt}</TableCell>
                                      </TableRow>
                                    ))
                                  )}
                                </TableBody>
                              </Table>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </Fragment>
                  );
                })}
                {selectedProfiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Typography variant="body2" color="text.secondary">
                        Select patient profiles in the workspace to queue them for review.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </Stack>
        </Paper>
      )}

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

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={requestCloseDrawer}
        PaperProps={{ sx: { width: { xs: "100%", sm: 420, md: "38vw" } } }}
      >
        {/* Drawer keeps the main table visible, preserving context better than a modal. */}
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <Box
            sx={{
              p: 2,
              borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h6">
                {drawerMode === "edit" ? "Edit Patient Profile" : "New Patient Profile"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Build or refine a single profile without leaving the table.
              </Typography>
            </Box>
            <IconButton onClick={requestCloseDrawer}>
              <Close />
            </IconButton>
          </Box>

          <Box sx={{ p: 2, overflowY: "auto", flex: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              1) Profile metadata
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12}>
                <TextField
                  required
                  label="Name"
                  value={draftProfile.name}
                  onChange={(event) => handleDraftChange("name", event.target.value)}
                  error={!draftProfile.name.trim()}
                  helperText={!draftProfile.name.trim() ? "Name is required." : ""}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  label="Indication"
                  value={draftProfile.indication}
                  onChange={(event) =>
                    handleDraftChange("indication", event.target.value)
                  }
                  error={!draftProfile.indication.trim()}
                  helperText={!draftProfile.indication.trim() ? "Indication is required." : ""}
                  fullWidth
                />
              </Grid>
            </Grid>

            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              2) Benchmark studies
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
              <TextField
                label="Add benchmark study"
                value={newBenchmark}
                onChange={(event) => setNewBenchmark(event.target.value)}
                fullWidth
              />
              <IconButton color="primary" onClick={handleAddBenchmark}>
                <Add />
              </IconButton>
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
              {(draftProfile.benchmarkStudies || []).map((study) => (
                <Chip
                  key={study}
                  label={study}
                  onDelete={() => handleRemoveBenchmark(study)}
                  deleteIcon={<DeleteOutline />}
                />
              ))}
              {draftProfile.benchmarkStudies.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Add the benchmark studies used to ground this profile.
                </Typography>
              ) : null}
            </Box>

            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              3) Inclusion / exclusion criteria
            </Typography>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Use free text for each criterion. Lists remain row-scoped.
              </Typography>
              <Button size="small" variant="outlined" onClick={handleOpenSuggest}>
                Suggest Criteria
              </Button>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Inclusion criteria
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                  <TextField
                    label="Add inclusion criterion"
                    value={newInclusion}
                    onChange={(event) => setNewInclusion(event.target.value)}
                    fullWidth
                  />
                  <IconButton color="primary" onClick={() => handleAddCriterion("inclusion")}>
                    <Add />
                  </IconButton>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1,
                    maxHeight: 140,
                    overflowY: "auto",
                    mb: 2,
                  }}
                >
                  {(draftProfile.inclusionCriteria || []).map((item) => (
                    <Chip
                      key={item}
                      label={item}
                      onDelete={() => handleRemoveCriterion("inclusion", item)}
                      deleteIcon={<DeleteOutline />}
                    />
                  ))}
                  {draftProfile.inclusionCriteria.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No inclusion criteria added yet.
                    </Typography>
                  ) : null}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Exclusion criteria
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                  <TextField
                    label="Add exclusion criterion"
                    value={newExclusion}
                    onChange={(event) => setNewExclusion(event.target.value)}
                    fullWidth
                  />
                  <IconButton color="primary" onClick={() => handleAddCriterion("exclusion")}>
                    <Add />
                  </IconButton>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1,
                    maxHeight: 140,
                    overflowY: "auto",
                  }}
                >
                  {(draftProfile.exclusionCriteria || []).map((item) => (
                    <Chip
                      key={item}
                      label={item}
                      onDelete={() => handleRemoveCriterion("exclusion", item)}
                      deleteIcon={<DeleteOutline />}
                    />
                  ))}
                  {draftProfile.exclusionCriteria.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No exclusion criteria added yet.
                    </Typography>
                  ) : null}
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Box
            sx={{
              p: 2,
              borderTop: "1px solid rgba(0, 0, 0, 0.12)",
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", gap: 1 }}>
              <input
                ref={fileInputRef}
                type="file"
                hidden
                onChange={handleImportFile}
                accept=".pdf,.doc,.docx"
              />
              <Button variant="outlined" startIcon={<UploadFile />} onClick={handleImportClick}>
                Import from document
              </Button>
            </Box>
            <Box sx={{ display: "flex", gap: 1, ml: "auto" }}>
              <Button variant="text" onClick={requestCloseDrawer}>
                Cancel
              </Button>
              <Tooltip title={isSaveDisabled ? "Name and indication are required." : ""}>
                <span>
                  <Button variant="contained" onClick={handleSaveProfile} disabled={isSaveDisabled}>
                    Save Profile
                  </Button>
                </span>
              </Tooltip>
            </Box>
          </Box>
        </Box>
      </Drawer>

      <Dialog
        open={discardConfirmOpen}
        onClose={() => setDiscardConfirmOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Discard changes?</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2">
            You have unsaved changes in this profile. Discard and close the drawer?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDiscardConfirmOpen(false)}>Keep editing</Button>
          <Button variant="contained" color="error" onClick={handleDiscardChanges}>
            Discard
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={suggestOpen}
        onClose={() => setSuggestOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Suggest criteria</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12}>
              <TextField
                label="Study Title"
                value={suggestForm.studyTitle}
                onChange={(event) =>
                  setSuggestForm((prev) => ({ ...prev, studyTitle: event.target.value }))
                }
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Indication"
                value={suggestForm.indication}
                onChange={(event) =>
                  setSuggestForm((prev) => ({ ...prev, indication: event.target.value }))
                }
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                value={suggestForm.description}
                onChange={(event) =>
                  setSuggestForm((prev) => ({ ...prev, description: event.target.value }))
                }
                fullWidth
                multiline
                minRows={3}
              />
            </Grid>
          </Grid>
          <Button variant="outlined" onClick={handleGenerateSuggestions}>
            Generate
          </Button>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Inclusion suggestions
            </Typography>
            {suggestions.inclusion.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No suggestions yet.
              </Typography>
            ) : (
              suggestions.inclusion.map((item) => (
                <Box key={item} sx={{ display: "flex", gap: 1, mb: 1 }}>
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {item}
                  </Typography>
                  <Button size="small" onClick={() => handleAcceptSuggestion("inclusion", item)}>
                    Accept
                  </Button>
                  <Button
                    size="small"
                    color="inherit"
                    onClick={() => handleRejectSuggestion("inclusion", item)}
                  >
                    Reject
                  </Button>
                </Box>
              ))
            )}
          </Box>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Exclusion suggestions
            </Typography>
            {suggestions.exclusion.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No suggestions yet.
              </Typography>
            ) : (
              suggestions.exclusion.map((item) => (
                <Box key={item} sx={{ display: "flex", gap: 1, mb: 1 }}>
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {item}
                  </Typography>
                  <Button size="small" onClick={() => handleAcceptSuggestion("exclusion", item)}>
                    Accept
                  </Button>
                  <Button
                    size="small"
                    color="inherit"
                    onClick={() => handleRejectSuggestion("exclusion", item)}
                  >
                    Reject
                  </Button>
                </Box>
              ))
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSuggestOpen(false)}>Cancel</Button>
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
                  Benchmark studies: {profile.benchmarkStudies.length}
                </Typography>
              </Paper>
            ))
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setComparisonOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Share for review</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Stakeholders can view this profile snapshot and add comments, but they
            cannot edit or change its status.
          </Typography>
          <TextField
            label="Shareable link"
            value={shareLink}
            fullWidth
            InputProps={{ readOnly: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PatientProfilePage;
