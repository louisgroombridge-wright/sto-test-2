import {
  Box,
  Chip,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  TableContainer,
  Popover,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Tabs,
  Toolbar,
  Tooltip,
  Typography,
  Button,
  Select,
  InputLabel,
  ListItemText,
  Divider,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useEffect, useMemo, useState } from "react";

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

const initialFilters = {
  country: [],
  priorTrialExperience: "",
  niceToHaveCriteriaMet: "",
  createdBy: { mode: "contains", value: "" },
  updatedBy: { mode: "contains", value: "" },
  compositeSiteScore: { mode: "contains", value: "" },
  historicalEnrollmentRate: { min: "", max: "" },
  timeToFirstPatient: { min: "", max: "" },
  siteActivationTime: { min: "", max: "" },
  screeningSuccessRate: { min: "", max: "" },
  dropoutRate: { min: "", max: "" },
  competitiveTrialOverlap: { min: "", max: "" },
};

const parseNumber = (value) => {
  if (!value || value === "Unknown") {
    return null;
  }
  const match = `${value}`.replace(/,/g, "").match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : null;
};

const textMatches = (value, filter) => {
  if (!filter.value) {
    return true;
  }
  const normalized = (value || "").toLowerCase();
  const target = filter.value.toLowerCase();
  if (filter.mode === "not_contains") {
    return !normalized.includes(target);
  }
  return normalized.includes(target);
};

const SHORTLIST_STORAGE_KEY = "siteRecommendationShortlist";
const SUGGESTIONS_STORAGE_KEY = "siteRecommendationSuggestions";

const SiteRecommendationPage = ({ sharedView = false }) => {
  const [sites, setSites] = useState(initialSites);
  const [selectedSites, setSelectedSites] = useState({});
  const [searchValue, setSearchValue] = useState("");
  const [filters, setFilters] = useState(initialFilters);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [filterAnchor, setFilterAnchor] = useState({ column: "", anchorEl: null });
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [activeSiteId, setActiveSiteId] = useState("");
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [evidenceDialogOpen, setEvidenceDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("recommendations");
  const [shortlist, setShortlist] = useState(() => {
    if (typeof window === "undefined") {
      return [];
    }
    const stored = window.localStorage.getItem(SHORTLIST_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [suggestions, setSuggestions] = useState(() => {
    if (typeof window === "undefined") {
      return [];
    }
    const stored = window.localStorage.getItem(SUGGESTIONS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });
  const [suggestAddOpen, setSuggestAddOpen] = useState(false);
  const [suggestRemoveOpen, setSuggestRemoveOpen] = useState(false);
  const [suggestionDraft, setSuggestionDraft] = useState({
    siteName: "",
    country: "",
    city: "",
    comment: "",
    targetSiteId: "",
  });
  const [suggestionDecision, setSuggestionDecision] = useState({
    open: false,
    suggestionId: "",
    action: "",
    responseNote: "",
  });

  const handleSelectSite = (siteId, checked) => {
    setSelectedSites((prev) => ({
      ...prev,
      [siteId]: checked,
    }));
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SHORTLIST_STORAGE_KEY, JSON.stringify(shortlist));
    }
  }, [shortlist]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SUGGESTIONS_STORAGE_KEY, JSON.stringify(suggestions));
    }
  }, [suggestions]);

  const handleMenuOpen = (event, siteId) => {
    setMenuAnchor(event.currentTarget);
    setActiveSiteId(siteId);
  };

  const handleMenuClose = (clearActive = true) => {
    setMenuAnchor(null);
    if (clearActive) {
      setActiveSiteId("");
    }
  };

  const handleSortRequest = (columnKey) => {
    setSortConfig((prev) => {
      if (prev.key === columnKey) {
        return {
          key: columnKey,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key: columnKey, direction: "asc" };
    });
  };

  const handleOpenFilter = (event, columnKey) => {
    setFilterAnchor({ column: columnKey, anchorEl: event.currentTarget });
  };

  const handleCloseFilter = () => {
    setFilterAnchor({ column: "", anchorEl: null });
  };

  const handleRangeFilterChange = (columnKey, field, value) => {
    setFilters((prev) => ({
      ...prev,
      [columnKey]: {
        ...prev[columnKey],
        [field]: value,
      },
    }));
  };

  const handleTextFilterChange = (columnKey, field, value) => {
    setFilters((prev) => ({
      ...prev,
      [columnKey]: {
        ...prev[columnKey],
        [field]: value,
      },
    }));
  };

  const handleSelectFilterChange = (columnKey, value) => {
    setFilters((prev) => ({
      ...prev,
      [columnKey]: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
    setSearchValue("");
  };

  const handleAddToShortlist = (siteId) => {
    setShortlist((prev) => (prev.includes(siteId) ? prev : [...prev, siteId]));
  };

  const handleRemoveFromShortlist = (siteId) => {
    setShortlist((prev) => prev.filter((id) => id !== siteId));
  };

  const handleAddToShortlistFromMenu = () => {
    if (activeSiteId) {
      handleAddToShortlist(activeSiteId);
    }
    handleMenuClose();
  };

  const handleRemoveFromShortlistFromMenu = () => {
    if (activeSiteId) {
      handleRemoveFromShortlist(activeSiteId);
    }
    handleMenuClose();
  };

  const handleShareForReview = () => {
    setShareDialogOpen(true);
  };

  const handleOpenSuggestAdd = () => {
    setSuggestionDraft({
      siteName: "",
      country: "",
      city: "",
      comment: "",
      targetSiteId: "",
    });
    setSuggestAddOpen(true);
  };

  const handleOpenSuggestRemove = (siteId = "") => {
    setSuggestionDraft((prev) => ({
      ...prev,
      targetSiteId: siteId,
      comment: "",
    }));
    setSuggestRemoveOpen(true);
  };

  const handleSubmitSuggestAdd = () => {
    if (!suggestionDraft.comment.trim() || !suggestionDraft.siteName.trim()) {
      return;
    }
    setSuggestions((prev) => [
      ...prev,
      {
        id: `suggest-${Date.now()}`,
        type: "Add",
        siteName: suggestionDraft.siteName.trim(),
        country: suggestionDraft.country.trim() || "Unknown",
        city: suggestionDraft.city.trim() || "Unknown",
        comment: suggestionDraft.comment.trim(),
        suggestedBy: "External reviewer",
        suggestedAt: formatTimestamp(),
        status: "Pending",
        responseNote: "",
      },
    ]);
    setSuggestAddOpen(false);
  };

  const handleSubmitSuggestRemove = () => {
    if (!suggestionDraft.comment.trim() || !suggestionDraft.targetSiteId) {
      return;
    }
    const targetSite = sites.find((site) => site.siteId === suggestionDraft.targetSiteId);
    setSuggestions((prev) => [
      ...prev,
      {
        id: `suggest-${Date.now()}`,
        type: "Remove",
        siteName: targetSite?.siteName || "Unknown site",
        country: targetSite?.country || "Unknown",
        city: targetSite?.city || "Unknown",
        comment: suggestionDraft.comment.trim(),
        suggestedBy: "External reviewer",
        suggestedAt: formatTimestamp(),
        status: "Pending",
        responseNote: "",
      },
    ]);
    setSuggestRemoveOpen(false);
  };

  const handleDecisionOpen = (suggestionId, action) => {
    setSuggestionDecision({
      open: true,
      suggestionId,
      action,
      responseNote: "",
    });
  };

  const handleDecisionClose = () => {
    setSuggestionDecision({
      open: false,
      suggestionId: "",
      action: "",
      responseNote: "",
    });
  };

  const handleDecisionSubmit = () => {
    const { suggestionId, action, responseNote } = suggestionDecision;
    setSuggestions((prev) =>
      prev.map((suggestion) =>
        suggestion.id === suggestionId
          ? {
              ...suggestion,
              status: action,
              responseNote,
              decidedAt: formatTimestamp(),
              decidedBy: "Owner",
            }
          : suggestion
      )
    );
    handleDecisionClose();
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

  const handleOpenNoteDialog = (siteId = activeSiteId) => {
    const activeSite = sites.find((site) => site.siteId === siteId);
    setNoteDraft(activeSite?.notes ?? "");
    setActiveSiteId(siteId);
    setNoteDialogOpen(true);
    handleMenuClose(false);
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

  const countryOptions = useMemo(
    () => Array.from(new Set(sites.map((site) => site.country).filter(Boolean))),
    [sites]
  );

  const filteredSites = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();
    return sites.filter((site) => {
      const matchesSearch =
        !normalizedSearch ||
        [site.siteName, site.country, site.city, site.createdBy, site.updatedBy]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedSearch));
      const matchesCountry =
        filters.country.length === 0 || filters.country.includes(site.country);
      const matchesExperience =
        !filters.priorTrialExperience ||
        site.priorTrialExperience === filters.priorTrialExperience;
      const matchesNiceToHave =
        !filters.niceToHaveCriteriaMet ||
        site.niceToHaveCriteriaMet === filters.niceToHaveCriteriaMet;
      const matchesCreatedBy = textMatches(site.createdBy, filters.createdBy);
      const matchesUpdatedBy = textMatches(site.updatedBy, filters.updatedBy);
      const matchesCompositeScore = textMatches(site.compositeSiteScore, filters.compositeSiteScore);

      const enrollmentValue = parseNumber(site.historicalEnrollmentRate);
      const ttfpValue = parseNumber(site.timeToFirstPatient);
      const activationValue = parseNumber(site.siteActivationTime);
      const screeningValue = parseNumber(site.screeningSuccessRate);
      const dropoutValue = parseNumber(site.dropoutRate);
      const overlapValue = parseNumber(site.competitiveTrialOverlap);

      const matchesRange = (value, range) => {
        const min = range.min !== "" ? Number(range.min) : null;
        const max = range.max !== "" ? Number(range.max) : null;
        if (value === null) {
          return min === null && max === null;
        }
        if (min !== null && value < min) {
          return false;
        }
        if (max !== null && value > max) {
          return false;
        }
        return true;
      };

      return (
        matchesSearch &&
        matchesCountry &&
        matchesExperience &&
        matchesNiceToHave &&
        matchesCreatedBy &&
        matchesUpdatedBy &&
        matchesCompositeScore &&
        matchesRange(enrollmentValue, filters.historicalEnrollmentRate) &&
        matchesRange(ttfpValue, filters.timeToFirstPatient) &&
        matchesRange(activationValue, filters.siteActivationTime) &&
        matchesRange(screeningValue, filters.screeningSuccessRate) &&
        matchesRange(dropoutValue, filters.dropoutRate) &&
        matchesRange(overlapValue, filters.competitiveTrialOverlap)
      );
    });
  }, [filters, searchValue, sites]);

  const sortedSites = useMemo(() => {
    if (!sortConfig.key) {
      return filteredSites;
    }
    const sorted = [...filteredSites];
    const direction = sortConfig.direction === "asc" ? 1 : -1;
    const getSortValue = (site, key) => {
      if (
        [
          "historicalEnrollmentRate",
          "timeToFirstPatient",
          "siteActivationTime",
          "screeningSuccessRate",
          "dropoutRate",
          "competitiveTrialOverlap",
        ].includes(key)
      ) {
        return parseNumber(site[key]);
      }
      return site[key] || "";
    };
    sorted.sort((a, b) => {
      const aValue = getSortValue(a, sortConfig.key);
      const bValue = getSortValue(b, sortConfig.key);
      if (aValue === null && bValue === null) {
        return 0;
      }
      if (aValue === null) {
        return 1;
      }
      if (bValue === null) {
        return -1;
      }
      if (typeof aValue === "number" && typeof bValue === "number") {
        return (aValue - bValue) * direction;
      }
      return `${aValue}`.localeCompare(`${bValue}`) * direction;
    });
    return sorted;
  }, [filteredSites, sortConfig]);

  const summary = useMemo(() => {
    const selectedIds = Object.keys(selectedSites).filter((siteId) => selectedSites[siteId]);
    const selectedCount = selectedIds.length;
    const includedCount = sites.filter((site) => site.decisionStatus === "Included").length;
    const excludedCount = sites.filter((site) => site.decisionStatus === "Excluded").length;
    return { selectedCount, includedCount, excludedCount };
  }, [selectedSites, sites]);

  const shortlistedSites = useMemo(
    () => sites.filter((site) => shortlist.includes(site.siteId)),
    [shortlist, sites]
  );

  const pendingSuggestions = useMemo(
    () => suggestions.filter((suggestion) => suggestion.status === "Pending"),
    [suggestions]
  );

  const sharedLink = useMemo(() => {
    if (typeof window === "undefined") {
      return "https://example.com/site-recommendation/shared";
    }
    return `${window.location.origin}/site-recommendation/shared`;
  }, []);

  const isFilterActive = (columnKey) => {
    const value = filters[columnKey];
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    if (value && typeof value === "object" && ("min" in value || "max" in value)) {
      return value.min !== "" || value.max !== "";
    }
    if (value && typeof value === "object" && "value" in value) {
      return value.value !== "";
    }
    return !!value;
  };

  const filterChips = useMemo(() => {
    const chips = [];
    if (searchValue.trim()) {
      chips.push({
        key: "search",
        label: `Search: ${searchValue.trim()}`,
        onDelete: () => setSearchValue(""),
      });
    }
    if (filters.country.length > 0) {
      chips.push({
        key: "country",
        label: `Country = ${filters.country.join(", ")}`,
        onDelete: () => handleSelectFilterChange("country", []),
      });
    }
    if (filters.priorTrialExperience) {
      chips.push({
        key: "priorTrialExperience",
        label: `Prior trial experience = ${filters.priorTrialExperience}`,
        onDelete: () => handleSelectFilterChange("priorTrialExperience", ""),
      });
    }
    if (filters.niceToHaveCriteriaMet) {
      chips.push({
        key: "niceToHaveCriteriaMet",
        label: `Nice-to-have = ${filters.niceToHaveCriteriaMet}`,
        onDelete: () => handleSelectFilterChange("niceToHaveCriteriaMet", ""),
      });
    }
    const rangeChip = (key, label) => {
      const range = filters[key];
      if (range.min === "" && range.max === "") {
        return;
      }
      chips.push({
        key,
        label: `${label} ${range.min !== "" ? `≥ ${range.min}` : ""}${
          range.min !== "" && range.max !== "" ? " and " : ""
        }${range.max !== "" ? `≤ ${range.max}` : ""}`.trim(),
        onDelete: () => {
          handleRangeFilterChange(key, "min", "");
          handleRangeFilterChange(key, "max", "");
        },
      });
    };
    rangeChip("historicalEnrollmentRate", "Enrollment rate");
    rangeChip("timeToFirstPatient", "TTFP");
    rangeChip("siteActivationTime", "Activation time");
    rangeChip("screeningSuccessRate", "Screening success");
    rangeChip("dropoutRate", "Dropout rate");
    rangeChip("competitiveTrialOverlap", "Competitive overlap");
    const textChip = (key, label) => {
      if (!filters[key].value) {
        return;
      }
      chips.push({
        key,
        label: `${label} ${
          filters[key].mode === "not_contains" ? "does not contain" : "contains"
        } "${filters[key].value}"`,
        onDelete: () => handleTextFilterChange(key, "value", ""),
      });
    };
    textChip("createdBy", "Created By");
    textChip("updatedBy", "Updated By");
    textChip("compositeSiteScore", "Composite Score");
    return chips;
  }, [filters, searchValue]);

  const renderFilterContent = () => {
    const column = filterAnchor.column;
    if (!column) {
      return null;
    }
    if (column === "country") {
      return (
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel id="country-filter-label">Country</InputLabel>
          <Select
            labelId="country-filter-label"
            multiple
            value={filters.country}
            label="Country"
            renderValue={(selected) => selected.join(", ")}
            onChange={(event) => handleSelectFilterChange("country", event.target.value)}
          >
            {countryOptions.map((country) => (
              <MenuItem key={country} value={country}>
                <Checkbox checked={filters.country.includes(country)} />
                <ListItemText primary={country} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }
    if (column === "priorTrialExperience") {
      return (
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel id="experience-filter-label">Prior trial experience</InputLabel>
          <Select
            labelId="experience-filter-label"
            label="Prior trial experience"
            value={filters.priorTrialExperience}
            onChange={(event) => handleSelectFilterChange("priorTrialExperience", event.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Yes">Yes</MenuItem>
            <MenuItem value="Partial">Partial</MenuItem>
            <MenuItem value="No">No</MenuItem>
          </Select>
        </FormControl>
      );
    }
    if (column === "niceToHaveCriteriaMet") {
      return (
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="nice-to-have-filter-label">Nice-to-have</InputLabel>
          <Select
            labelId="nice-to-have-filter-label"
            label="Nice-to-have"
            value={filters.niceToHaveCriteriaMet}
            onChange={(event) => handleSelectFilterChange("niceToHaveCriteriaMet", event.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Yes">Yes</MenuItem>
            <MenuItem value="No">No</MenuItem>
          </Select>
        </FormControl>
      );
    }
    if (["createdBy", "updatedBy", "compositeSiteScore"].includes(column)) {
      const labelMap = {
        createdBy: "Created by",
        updatedBy: "Updated by",
        compositeSiteScore: "Composite score",
      };
      return (
        <Stack spacing={2} sx={{ minWidth: 240 }}>
          <FormControl size="small">
            <InputLabel id={`${column}-mode-label`}>Match type</InputLabel>
            <Select
              labelId={`${column}-mode-label`}
              label="Match type"
              value={filters[column].mode}
              onChange={(event) => handleTextFilterChange(column, "mode", event.target.value)}
            >
              <MenuItem value="contains">Contains</MenuItem>
              <MenuItem value="not_contains">Does not contain</MenuItem>
            </Select>
          </FormControl>
          <TextField
            size="small"
            label={labelMap[column]}
            value={filters[column].value}
            onChange={(event) => handleTextFilterChange(column, "value", event.target.value)}
          />
        </Stack>
      );
    }
    if (
      [
        "historicalEnrollmentRate",
        "timeToFirstPatient",
        "siteActivationTime",
        "screeningSuccessRate",
        "dropoutRate",
        "competitiveTrialOverlap",
      ].includes(column)
    ) {
      const labelMap = {
        historicalEnrollmentRate: "Enrollment rate (patients/month)",
        timeToFirstPatient: "Time to first patient (days)",
        siteActivationTime: "Site activation time (days)",
        screeningSuccessRate: "Screening success rate (%)",
        dropoutRate: "Dropout rate (%)",
        competitiveTrialOverlap: "Competitive trial overlap (trials)",
      };
      return (
        <Stack spacing={2} sx={{ minWidth: 240 }}>
          <TextField
            size="small"
            label="Min"
            type="number"
            value={filters[column].min}
            onChange={(event) => handleRangeFilterChange(column, "min", event.target.value)}
            inputProps={{ step: "any" }}
          />
          <TextField
            size="small"
            label="Max"
            type="number"
            value={filters[column].max}
            onChange={(event) => handleRangeFilterChange(column, "max", event.target.value)}
            inputProps={{ step: "any" }}
          />
          <Typography variant="caption" color="text.secondary">
            {labelMap[column]}
          </Typography>
        </Stack>
      );
    }
    return null;
  };

  if (sharedView) {
    return (
      <Box sx={{ p: 4, display: "flex", flexDirection: "column", gap: 3 }}>
        <Paper elevation={0} sx={{ p: 3, border: "1px solid rgba(0, 0, 0, 0.12)" }}>
          <Stack spacing={1}>
            <Typography variant="h5">Shared Shortlist Review</Typography>
            <Typography variant="body2" color="text.secondary">
              This view is suggestion-only. External reviewers can propose changes with required
              comments, but cannot modify the shortlist directly.
            </Typography>
          </Stack>
        </Paper>

        <Paper elevation={0} sx={{ p: 2, border: "1px solid rgba(0, 0, 0, 0.12)" }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
            <Button variant="contained" onClick={handleOpenSuggestAdd}>
              Suggest New Site
            </Button>
            <Button variant="outlined" onClick={handleOpenSuggestRemove}>
              Suggest Removal
            </Button>
            <Typography variant="body2" color="text.secondary">
              Suggestions require comments and are reviewed by the scenario owner.
            </Typography>
          </Stack>
        </Paper>

        <Paper elevation={0} sx={{ border: "1px solid rgba(0, 0, 0, 0.12)" }}>
          <TableContainer sx={{ maxWidth: "100%", overflowX: "auto" }}>
            <Table size="small" sx={{ minWidth: 1200 }}>
              <TableHead>
                <TableRow>
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
              {shortlistedSites.map((site) => (
                <TableRow key={site.siteId} hover>
                  <TableCell>{site.siteName}</TableCell>
                  <TableCell>{site.country || "Unknown"}</TableCell>
                  <TableCell>{site.city || "Unknown"}</TableCell>
                  <TableCell>{site.historicalEnrollmentRate || "Unknown"}</TableCell>
                  <TableCell>{site.timeToFirstPatient || "Unknown"}</TableCell>
                  <TableCell>{site.siteActivationTime || "Unknown"}</TableCell>
                  <TableCell>{site.screeningSuccessRate || "Unknown"}</TableCell>
                  <TableCell>{site.dropoutRate || "Unknown"}</TableCell>
                  <TableCell>{site.priorTrialExperience || "Unknown"}</TableCell>
                  <TableCell>{site.competitiveTrialOverlap || "Unknown"}</TableCell>
                  <TableCell>{site.compositeSiteScore || "Unknown"}</TableCell>
                  <TableCell>{site.niceToHaveCriteriaMet || "Unknown"}</TableCell>
                  <TableCell>{site.createdBy || "Unknown"}</TableCell>
                  <TableCell>{site.updatedBy || "Unknown"}</TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => handleOpenSuggestRemove(site.siteId)}>
                      Suggest removal
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {shortlistedSites.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={15}>
                    <Typography variant="body2" color="text.secondary">
                      No sites are currently shortlisted for this scenario.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Dialog open={suggestAddOpen} onClose={() => setSuggestAddOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>Suggest New Site</DialogTitle>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Site name"
              value={suggestionDraft.siteName}
              onChange={(event) =>
                setSuggestionDraft((prev) => ({ ...prev, siteName: event.target.value }))
              }
              required
            />
            <TextField
              label="Country"
              value={suggestionDraft.country}
              onChange={(event) =>
                setSuggestionDraft((prev) => ({ ...prev, country: event.target.value }))
              }
            />
            <TextField
              label="City"
              value={suggestionDraft.city}
              onChange={(event) =>
                setSuggestionDraft((prev) => ({ ...prev, city: event.target.value }))
              }
            />
            <TextField
              label="Comment (required)"
              value={suggestionDraft.comment}
              onChange={(event) =>
                setSuggestionDraft((prev) => ({ ...prev, comment: event.target.value }))
              }
              multiline
              minRows={3}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSuggestAddOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleSubmitSuggestAdd}
              disabled={!suggestionDraft.comment.trim() || !suggestionDraft.siteName.trim()}
            >
              Submit suggestion
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={suggestRemoveOpen}
          onClose={() => setSuggestRemoveOpen(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Suggest Removal</DialogTitle>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <FormControl size="small">
              <InputLabel id="suggest-remove-label">Select site</InputLabel>
              <Select
                labelId="suggest-remove-label"
                label="Select site"
                value={suggestionDraft.targetSiteId}
                onChange={(event) =>
                  setSuggestionDraft((prev) => ({ ...prev, targetSiteId: event.target.value }))
                }
              >
                {shortlistedSites.map((site) => (
                  <MenuItem key={site.siteId} value={site.siteId}>
                    {site.siteName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Comment (required)"
              value={suggestionDraft.comment}
              onChange={(event) =>
                setSuggestionDraft((prev) => ({ ...prev, comment: event.target.value }))
              }
              multiline
              minRows={3}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSuggestRemoveOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleSubmitSuggestRemove}
              disabled={!suggestionDraft.comment.trim() || !suggestionDraft.targetSiteId}
            >
              Submit suggestion
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, display: "flex", flexDirection: "column", gap: 3 }}>
      <Paper elevation={0} sx={{ border: "1px solid rgba(0, 0, 0, 0.12)" }}>
        <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)} sx={{ px: 2 }}>
          <Tab value="recommendations" label="Recommendations" />
          <Tab value="review" label={`Review (${shortlist.length})`} />
        </Tabs>
        <Divider />
        {activeTab === "recommendations" ? (
          <Toolbar sx={{ gap: 2, flexWrap: "wrap" }}>
            <TextField
              label="Search"
              placeholder="Search sites, countries, cities, users…"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              size="small"
              sx={{ minWidth: 260 }}
            />
            {/* Filters are user-directed to inspect trade-offs; no automatic ranking is applied. */}
          </Toolbar>
        ) : (
          <Toolbar sx={{ justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
            <Stack spacing={0.5}>
              <Typography variant="subtitle1">Shortlist Review</Typography>
              <Typography variant="body2" color="text.secondary">
                Review the shortlisted sites and apply explicit updates before sharing externally.
              </Typography>
            </Stack>
            <Button variant="contained" onClick={handleShareForReview}>
              Share for Review
            </Button>
          </Toolbar>
        )}
      </Paper>

      {activeTab === "recommendations" ? (
        <>
          <Paper elevation={0} sx={{ border: "1px solid rgba(0, 0, 0, 0.12)", p: 2 }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
              <Typography variant="subtitle2" color="text.secondary">
                Active filters
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {filterChips.length > 0 ? (
                  filterChips.map((chip) => (
                    <Chip key={chip.key} label={chip.label} onDelete={chip.onDelete} />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No filters applied.
                  </Typography>
                )}
              </Stack>
              <Box sx={{ flexGrow: 1 }} />
              <Button variant="text" onClick={handleClearFilters} disabled={filterChips.length === 0}>
                Clear all filters
              </Button>
            </Stack>
          </Paper>

          <Paper elevation={0} sx={{ border: "1px solid rgba(0, 0, 0, 0.12)" }}>
            <TableContainer sx={{ maxWidth: "100%", overflowX: "auto" }}>
              <Table size="small" sx={{ minWidth: 1400 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Select</TableCell>
                  <TableCell>Site Name</TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="subtitle2">Country</Typography>
                      <IconButton
                        size="small"
                        onClick={(event) => handleOpenFilter(event, "country")}
                        color={isFilterActive("country") ? "primary" : "default"}
                      >
                        <FilterListIcon fontSize="inherit" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                  <TableCell>City</TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <TableSortLabel
                        active={sortConfig.key === "historicalEnrollmentRate"}
                        direction={
                          sortConfig.key === "historicalEnrollmentRate" ? sortConfig.direction : "asc"
                        }
                        onClick={() => handleSortRequest("historicalEnrollmentRate")}
                      >
                        Historical Enrollment Rate
                      </TableSortLabel>
                      <IconButton
                        size="small"
                        onClick={(event) => handleOpenFilter(event, "historicalEnrollmentRate")}
                        color={isFilterActive("historicalEnrollmentRate") ? "primary" : "default"}
                      >
                        <FilterListIcon fontSize="inherit" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <TableSortLabel
                        active={sortConfig.key === "timeToFirstPatient"}
                        direction={sortConfig.key === "timeToFirstPatient" ? sortConfig.direction : "asc"}
                        onClick={() => handleSortRequest("timeToFirstPatient")}
                      >
                        Time to First Patient
                      </TableSortLabel>
                      <IconButton
                        size="small"
                        onClick={(event) => handleOpenFilter(event, "timeToFirstPatient")}
                        color={isFilterActive("timeToFirstPatient") ? "primary" : "default"}
                      >
                        <FilterListIcon fontSize="inherit" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <TableSortLabel
                        active={sortConfig.key === "siteActivationTime"}
                        direction={sortConfig.key === "siteActivationTime" ? sortConfig.direction : "asc"}
                        onClick={() => handleSortRequest("siteActivationTime")}
                      >
                        Site Activation Time
                      </TableSortLabel>
                      <IconButton
                        size="small"
                        onClick={(event) => handleOpenFilter(event, "siteActivationTime")}
                        color={isFilterActive("siteActivationTime") ? "primary" : "default"}
                      >
                        <FilterListIcon fontSize="inherit" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <TableSortLabel
                        active={sortConfig.key === "screeningSuccessRate"}
                        direction={sortConfig.key === "screeningSuccessRate" ? sortConfig.direction : "asc"}
                        onClick={() => handleSortRequest("screeningSuccessRate")}
                      >
                        Screening Success Rate
                      </TableSortLabel>
                      <IconButton
                        size="small"
                        onClick={(event) => handleOpenFilter(event, "screeningSuccessRate")}
                        color={isFilterActive("screeningSuccessRate") ? "primary" : "default"}
                      >
                        <FilterListIcon fontSize="inherit" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <TableSortLabel
                        active={sortConfig.key === "dropoutRate"}
                        direction={sortConfig.key === "dropoutRate" ? sortConfig.direction : "asc"}
                        onClick={() => handleSortRequest("dropoutRate")}
                      >
                        Dropout Rate
                      </TableSortLabel>
                      <IconButton
                        size="small"
                        onClick={(event) => handleOpenFilter(event, "dropoutRate")}
                        color={isFilterActive("dropoutRate") ? "primary" : "default"}
                      >
                        <FilterListIcon fontSize="inherit" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="subtitle2">Prior Trial Experience</Typography>
                      <IconButton
                        size="small"
                        onClick={(event) => handleOpenFilter(event, "priorTrialExperience")}
                        color={isFilterActive("priorTrialExperience") ? "primary" : "default"}
                      >
                        <FilterListIcon fontSize="inherit" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <TableSortLabel
                        active={sortConfig.key === "competitiveTrialOverlap"}
                        direction={
                          sortConfig.key === "competitiveTrialOverlap" ? sortConfig.direction : "asc"
                        }
                        onClick={() => handleSortRequest("competitiveTrialOverlap")}
                      >
                        Competitive Trial Overlap
                      </TableSortLabel>
                      <IconButton
                        size="small"
                        onClick={(event) => handleOpenFilter(event, "competitiveTrialOverlap")}
                        color={isFilterActive("competitiveTrialOverlap") ? "primary" : "default"}
                      >
                        <FilterListIcon fontSize="inherit" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <TableSortLabel
                        active={sortConfig.key === "compositeSiteScore"}
                        direction={sortConfig.key === "compositeSiteScore" ? sortConfig.direction : "asc"}
                        onClick={() => handleSortRequest("compositeSiteScore")}
                      >
                        Composite Site Score
                      </TableSortLabel>
                      <IconButton
                        size="small"
                        onClick={(event) => handleOpenFilter(event, "compositeSiteScore")}
                        color={isFilterActive("compositeSiteScore") ? "primary" : "default"}
                      >
                        <FilterListIcon fontSize="inherit" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="subtitle2">Nice-to-Have Criteria Met</Typography>
                      <IconButton
                        size="small"
                        onClick={(event) => handleOpenFilter(event, "niceToHaveCriteriaMet")}
                        color={isFilterActive("niceToHaveCriteriaMet") ? "primary" : "default"}
                      >
                        <FilterListIcon fontSize="inherit" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <TableSortLabel
                        active={sortConfig.key === "createdBy"}
                        direction={sortConfig.key === "createdBy" ? sortConfig.direction : "asc"}
                        onClick={() => handleSortRequest("createdBy")}
                      >
                        Created By
                      </TableSortLabel>
                      <IconButton
                        size="small"
                        onClick={(event) => handleOpenFilter(event, "createdBy")}
                        color={isFilterActive("createdBy") ? "primary" : "default"}
                      >
                        <FilterListIcon fontSize="inherit" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <TableSortLabel
                        active={sortConfig.key === "updatedBy"}
                        direction={sortConfig.key === "updatedBy" ? sortConfig.direction : "asc"}
                        onClick={() => handleSortRequest("updatedBy")}
                      >
                        Updated By
                      </TableSortLabel>
                      <IconButton
                        size="small"
                        onClick={(event) => handleOpenFilter(event, "updatedBy")}
                        color={isFilterActive("updatedBy") ? "primary" : "default"}
                      >
                        <FilterListIcon fontSize="inherit" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedSites.map((site) => {
                  const isShortlisted = shortlist.includes(site.siteId);
                  return (
                    <TableRow key={site.siteId} hover>
                      <TableCell>
                        <Checkbox
                          checked={!!selectedSites[site.siteId]}
                          onChange={(event) => handleSelectSite(site.siteId, event.target.checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="subtitle2">{site.siteName}</Typography>
                            {isShortlisted ? <Chip label="Shortlisted" size="small" /> : null}
                          </Stack>
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
                  );
                })}
              </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <Popover
            open={Boolean(filterAnchor.anchorEl)}
            anchorEl={filterAnchor.anchorEl}
            onClose={handleCloseFilter}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          >
            <Box sx={{ p: 2 }}>{renderFilterContent()}</Box>
          </Popover>

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
        </>
      ) : (
        <>
          <Paper elevation={0} sx={{ border: "1px solid rgba(0, 0, 0, 0.12)" }}>
            <TableContainer sx={{ maxWidth: "100%", overflowX: "auto" }}>
              <Table size="small" sx={{ minWidth: 1200 }}>
              <TableHead>
                <TableRow>
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
                {shortlistedSites.map((site) => (
                  <TableRow key={site.siteId} hover>
                    <TableCell>{site.siteName}</TableCell>
                    <TableCell>{site.country || "Unknown"}</TableCell>
                    <TableCell>{site.city || "Unknown"}</TableCell>
                    <TableCell>{site.historicalEnrollmentRate || "Unknown"}</TableCell>
                    <TableCell>{site.timeToFirstPatient || "Unknown"}</TableCell>
                    <TableCell>{site.siteActivationTime || "Unknown"}</TableCell>
                    <TableCell>{site.screeningSuccessRate || "Unknown"}</TableCell>
                    <TableCell>{site.dropoutRate || "Unknown"}</TableCell>
                    <TableCell>{site.priorTrialExperience || "Unknown"}</TableCell>
                    <TableCell>{site.competitiveTrialOverlap || "Unknown"}</TableCell>
                    <TableCell>{site.compositeSiteScore || "Unknown"}</TableCell>
                    <TableCell>{site.niceToHaveCriteriaMet || "Unknown"}</TableCell>
                    <TableCell>{site.createdBy || "Unknown"}</TableCell>
                    <TableCell>{site.updatedBy || "Unknown"}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button size="small" onClick={() => handleRemoveFromShortlist(site.siteId)}>
                          Remove
                        </Button>
                        <Button size="small" onClick={() => handleOpenNoteDialog(site.siteId)}>
                          Add note
                        </Button>
                        <Button size="small" onClick={handleViewEvidence}>
                          View evidence
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {shortlistedSites.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={15}>
                      <Typography variant="body2" color="text.secondary">
                        No sites shortlisted yet. Add sites from the Recommendations tab.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <Paper elevation={0} sx={{ border: "1px solid rgba(0, 0, 0, 0.12)", p: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Pending suggestions
            </Typography>
            <Stack spacing={1}>
              {pendingSuggestions.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No pending suggestions from external reviewers.
                </Typography>
              ) : (
                pendingSuggestions.map((suggestion) => (
                  <Paper key={suggestion.id} variant="outlined" sx={{ p: 2 }}>
                    <Stack spacing={0.5}>
                      <Typography variant="subtitle2">
                        {suggestion.type} • {suggestion.siteName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {suggestion.country} • {suggestion.city}
                      </Typography>
                      <Typography variant="body2">Comment: {suggestion.comment}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Suggested by {suggestion.suggestedBy} on {suggestion.suggestedAt}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleDecisionOpen(suggestion.id, "Accepted")}
                        >
                          Accept
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleDecisionOpen(suggestion.id, "Rejected")}
                        >
                          Reject
                        </Button>
                      </Stack>
                    </Stack>
                  </Paper>
                ))
              )}
            </Stack>
          </Paper>
        </>
      )}

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        {shortlist.includes(activeSiteId) ? (
          <MenuItem onClick={handleRemoveFromShortlistFromMenu}>Remove from Shortlist</MenuItem>
        ) : (
          <MenuItem onClick={handleAddToShortlistFromMenu}>Add to Shortlist</MenuItem>
        )}
        <MenuItem onClick={handleInclude}>Include site</MenuItem>
        <MenuItem onClick={handleExclude}>Exclude site</MenuItem>
        <MenuItem onClick={handleOpenNoteDialog}>Add note</MenuItem>
        <MenuItem onClick={handleViewEvidence}>View evidence</MenuItem>
      </Menu>

      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Share for Review</DialogTitle>
        <DialogContent sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            This link is read-only. External reviewers can only submit suggestions with required
            comments; shortlist changes remain owner-controlled.
          </Typography>
          <TextField label="Review link" value={sharedLink} fullWidth InputProps={{ readOnly: true }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

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
        open={suggestionDecision.open}
        onClose={handleDecisionClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {suggestionDecision.action === "Accepted" ? "Accept suggestion" : "Reject suggestion"}
        </DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          <TextField
            label="Response note (optional)"
            value={suggestionDecision.responseNote}
            onChange={(event) =>
              setSuggestionDecision((prev) => ({ ...prev, responseNote: event.target.value }))
            }
            multiline
            minRows={3}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDecisionClose}>Cancel</Button>
          <Button variant="contained" onClick={handleDecisionSubmit}>
            Confirm
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
