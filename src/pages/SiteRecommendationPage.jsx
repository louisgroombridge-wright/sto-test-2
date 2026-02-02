import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Collapse,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";

const scenario = {
  name: "Scenario Alpha",
  patientProfiles: ["Refractory AML", "Older AML (65+)"],
  siteProfile: "Global Phase II Hematology Sites",
};

const approvedCountries = [
  {
    countryCode: "US",
    countryName: "United States",
    targetSiteCount: 6,
  },
  {
    countryCode: "DE",
    countryName: "Germany",
    targetSiteCount: 4,
  },
];

const initialSites = {
  US: [
    {
      siteId: "us-001",
      siteName: "Horizon Cancer Institute",
      country: "United States",
      city: "Boston, MA",
      recommendationTier: "Primary",
      whyThisSite: [
        "Recent AML phase II experience",
        "Dedicated hematology unit",
        "Rapid contract turnaround",
      ],
      relevantStudies: ["AML-211", "AML-241"],
      knownGaps: ["Awaiting ePRO validation"],
      enrollmentSignal: "High",
      recommendationSource: "Data-driven",
      status: "Pending",
      notes: "",
      generatedAt: "",
      decidedBy: "",
      decidedAt: "",
      overridden: false,
    },
    {
      siteId: "us-002",
      siteName: "Summit Oncology Center",
      country: "United States",
      city: "Chicago, IL",
      recommendationTier: "Secondary",
      whyThisSite: [
        "Geriatric oncology access",
        "High referral volume",
      ],
      relevantStudies: ["AML-197"],
      knownGaps: [],
      enrollmentSignal: "Medium",
      recommendationSource: "Required",
      status: "Pending",
      notes: "",
      generatedAt: "",
      decidedBy: "",
      decidedAt: "",
      overridden: false,
    },
  ],
  DE: [
    {
      siteId: "de-001",
      siteName: "Nordrhein Hematology Clinic",
      country: "Germany",
      city: "Cologne",
      recommendationTier: "Primary",
      whyThisSite: [
        "Consistent AML enrollment",
        "Experienced study coordinators",
      ],
      relevantStudies: ["AML-180", "AML-205"],
      knownGaps: ["Lab turnaround confirmation needed"],
      enrollmentSignal: "High",
      recommendationSource: "Data-driven",
      status: "Pending",
      notes: "",
      generatedAt: "",
      decidedBy: "",
      decidedAt: "",
      overridden: false,
    },
    {
      siteId: "de-002",
      siteName: "Bavaria University Hospital",
      country: "Germany",
      city: "Munich",
      recommendationTier: "Consider",
      whyThisSite: [
        "Strong inpatient oncology unit",
        "Available hematology beds",
      ],
      relevantStudies: ["AML-167"],
      knownGaps: ["No recent ePRO experience"],
      enrollmentSignal: "Low",
      recommendationSource: "Manual",
      status: "Pending",
      notes: "",
      generatedAt: "",
      decidedBy: "",
      decidedAt: "",
      overridden: false,
    },
  ],
};

const formatTimestamp = () =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());

const SiteRecommendationPage = () => {
  const [sitesByCountry, setSitesByCountry] = useState(initialSites);
  const [expandedCountries, setExpandedCountries] = useState(() =>
    Object.fromEntries(approvedCountries.map((country) => [country.countryCode, true]))
  );
  const [selectedSites, setSelectedSites] = useState({});
  const [notesDrafts, setNotesDrafts] = useState({});
  const [hasGenerated, setHasGenerated] = useState(false);
  const [generatedAt, setGeneratedAt] = useState("");
  const [reviewOutOfDate, setReviewOutOfDate] = useState(false);

  const handleToggleCountry = (countryCode) => {
    setExpandedCountries((prev) => ({
      ...prev,
      [countryCode]: !prev[countryCode],
    }));
  };

  const handleGenerate = () => {
    const timestamp = formatTimestamp();
    setGeneratedAt(timestamp);
    setHasGenerated(true);
    setReviewOutOfDate(false);
    setSitesByCountry((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((countryCode) => {
        next[countryCode] = next[countryCode].map((site) => ({
          ...site,
          generatedAt: timestamp,
        }));
      });
      return next;
    });
  };

  const handleSelectionChange = (siteId, checked) => {
    setSelectedSites((prev) => ({
      ...prev,
      [siteId]: checked,
    }));
  };

  const updateSite = (countryCode, siteId, updates) => {
    setSitesByCountry((prev) => ({
      ...prev,
      [countryCode]: prev[countryCode].map((site) =>
        site.siteId === siteId ? { ...site, ...updates } : site
      ),
    }));
    setReviewOutOfDate(true);
  };

  const handleInclude = (countryCode, siteId) => {
    updateSite(countryCode, siteId, {
      status: "Included",
      decidedBy: "J. Morgan",
      decidedAt: formatTimestamp(),
    });
  };

  const handleExclude = (countryCode, siteId) => {
    updateSite(countryCode, siteId, {
      status: "Excluded",
      decidedBy: "J. Morgan",
      decidedAt: formatTimestamp(),
    });
  };

  const handleNoteChange = (siteId, value) => {
    setNotesDrafts((prev) => ({
      ...prev,
      [siteId]: value,
    }));
  };

  const handleSaveNote = (countryCode, siteId) => {
    const noteValue = notesDrafts[siteId] || "";
    updateSite(countryCode, siteId, {
      notes: noteValue,
      overridden: noteValue.trim().length > 0,
    });
  };

  const handleBulkAction = (countryCode, action) => {
    const selectedForCountry = sitesByCountry[countryCode].filter(
      (site) => selectedSites[site.siteId]
    );
    selectedForCountry.forEach((site) => {
      if (action === "include") {
        handleInclude(countryCode, site.siteId);
      } else {
        handleExclude(countryCode, site.siteId);
      }
    });
  };

  const validationByCountry = useMemo(() => {
    return approvedCountries.reduce((acc, country) => {
      const sites = sitesByCountry[country.countryCode] || [];
      const includedCount = sites.filter((site) => site.status === "Included").length;
      const warnings = [];
      if (includedCount < country.targetSiteCount) {
        warnings.push("Included sites are below the target count.");
      }
      if (includedCount > country.targetSiteCount * 2) {
        warnings.push("Included sites are far above the target count.");
      }
      return {
        ...acc,
        [country.countryCode]: {
          includedCount,
          warnings,
        },
      };
    }, {});
  }, [sitesByCountry]);

  return (
    <Box sx={{ p: 4, display: "flex", flexDirection: "column", gap: 3 }}>
      <Paper elevation={0} sx={{ p: 3, border: "1px solid rgba(0, 0, 0, 0.12)" }}>
        <Stack spacing={1.5}>
          <Typography variant="h4" component="h1">
            Site Recommendations
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {scenario.name} • Shortlist recommendations are advisory and must be reviewed.
          </Typography>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} flexWrap="wrap">
            <Typography variant="body2" color="text.secondary">
              Patient Profiles: {scenario.patientProfiles.join(", ")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Site Profile: {scenario.siteProfile}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Approved Countries: {approvedCountries.map((country) => country.countryName).join(", ")}
            </Typography>
          </Stack>
          <Divider />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
            <Button
              variant="contained"
              onClick={handleGenerate}
            >
              {hasGenerated ? "Re-run Recommendations" : "Generate Site Recommendations"}
            </Button>
            <Typography variant="body2" color="text.secondary">
              {generatedAt ? `Last generated: ${generatedAt}` : "No recommendations generated yet."}
            </Typography>
          </Stack>
          {/* Ranking is advisory only; it does not decide site inclusion. */}
          <Typography variant="body2" color="text.secondary">
            Recommendation tiers help prioritize review but never auto-include sites.
          </Typography>
        </Stack>
      </Paper>

      <Stack spacing={2}>
        {approvedCountries.map((country) => {
          const countrySites = sitesByCountry[country.countryCode] || [];
          const summary = validationByCountry[country.countryCode];
          return (
            <Paper key={country.countryCode} elevation={0} sx={{ border: "1px solid rgba(0, 0, 0, 0.12)" }}>
              <Box sx={{ p: 2 }}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6">{country.countryName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Target sites: {country.targetSiteCount} • Recommended sites: {countrySites.length}
                    </Typography>
                  </Box>
                  <Button size="small" variant="text" onClick={() => handleToggleCountry(country.countryCode)}>
                    {expandedCountries[country.countryCode] ? "Hide sites" : "Show sites"}
                  </Button>
                </Stack>
              </Box>
              <Collapse in={expandedCountries[country.countryCode]} timeout="auto" unmountOnExit>
                <Divider />
                <Box sx={{ p: 2 }}>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={1} sx={{ mb: 2 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleBulkAction(country.countryCode, "include")}
                    >
                      Include selected
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => handleBulkAction(country.countryCode, "exclude")}
                    >
                      Exclude selected
                    </Button>
                  </Stack>
                  {summary?.warnings?.length ? (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      <Stack component="ul" sx={{ pl: 2, mb: 0 }}>
                        {summary.warnings.map((warning) => (
                          <li key={warning}>
                            <Typography variant="body2">{warning}</Typography>
                          </li>
                        ))}
                      </Stack>
                    </Alert>
                  ) : null}
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Include</TableCell>
                        <TableCell>Site name</TableCell>
                        <TableCell>City</TableCell>
                        <TableCell>Recommendation tier</TableCell>
                        <TableCell>Why this site?</TableCell>
                        <TableCell>Relevant experience</TableCell>
                        <TableCell>Known gaps / flags</TableCell>
                        <TableCell>Enrollment signal</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {countrySites.map((site) => {
                        const needsOverrideNote =
                          site.status === "Included" && site.knownGaps.length > 0 && !site.notes.trim();
                        return (
                          <TableRow key={site.siteId} hover>
                            <TableCell>
                              <Checkbox
                                checked={!!selectedSites[site.siteId]}
                                onChange={(event) =>
                                  handleSelectionChange(site.siteId, event.target.checked)
                                }
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
                            <TableCell>{site.city}</TableCell>
                            <TableCell>
                              <Chip label={site.recommendationTier} size="small" />
                            </TableCell>
                            <TableCell>
                              <Stack spacing={0.5}>
                                {site.whyThisSite.map((reason) => (
                                  <Typography variant="caption" key={reason}>
                                    • {reason}
                                  </Typography>
                                ))}
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={0.5} flexWrap="wrap">
                                {site.relevantStudies.map((study) => (
                                  <Chip key={study} label={study} size="small" variant="outlined" />
                                ))}
                              </Stack>
                            </TableCell>
                            <TableCell>
                              {site.knownGaps.length > 0 ? (
                                <Stack spacing={0.5}>
                                  {site.knownGaps.map((gap) => (
                                    <Typography variant="caption" key={gap} color="warning.main">
                                      {gap}
                                    </Typography>
                                  ))}
                                </Stack>
                              ) : (
                                <Typography variant="caption" color="text.secondary">
                                  No flagged gaps.
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{site.enrollmentSignal}</Typography>
                            </TableCell>
                            <TableCell>
                              <Stack spacing={0.5}>
                                <Chip
                                  label={site.status}
                                  size="small"
                                  color={site.status === "Included" ? "success" : site.status === "Excluded" ? "default" : "warning"}
                                  variant={site.status === "Excluded" ? "outlined" : "filled"}
                                />
                                {site.overridden ? (
                                  <Typography variant="caption" color="warning.main">
                                    Override noted
                                  </Typography>
                                ) : null}
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Stack spacing={1}>
                                <Stack direction="row" spacing={1}>
                                  <Button
                                    size="small"
                                    variant="contained"
                                    onClick={() => handleInclude(country.countryCode, site.siteId)}
                                  >
                                    Include
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    color="error"
                                    onClick={() => handleExclude(country.countryCode, site.siteId)}
                                  >
                                    Exclude
                                  </Button>
                                </Stack>
                                <TextField
                                  size="small"
                                  placeholder="Add override note"
                                  value={notesDrafts[site.siteId] ?? site.notes}
                                  onChange={(event) => handleNoteChange(site.siteId, event.target.value)}
                                  multiline
                                  minRows={2}
                                />
                                <Button
                                  size="small"
                                  variant="text"
                                  onClick={() => handleSaveNote(country.countryCode, site.siteId)}
                                >
                                  Save note
                                </Button>
                                <Button size="small" variant="text">
                                  View evidence
                                </Button>
                                {needsOverrideNote ? (
                                  <Typography variant="caption" color="error">
                                    Overrides require a note when known gaps exist.
                                  </Typography>
                                ) : null}
                                <Typography variant="caption" color="text.secondary">
                                  {site.decidedAt
                                    ? `Decision by ${site.decidedBy} on ${site.decidedAt}`
                                    : "No decision recorded yet."}
                                </Typography>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </Box>
              </Collapse>
            </Paper>
          );
        })}
      </Stack>

      <Paper elevation={0} sx={{ p: 2, border: "1px solid rgba(0, 0, 0, 0.12)" }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Validation & downstream flow
        </Typography>
        <Stack spacing={1.5}>
          <Alert severity={reviewOutOfDate ? "warning" : "info"}>
            Review & Approval step: {reviewOutOfDate ? "Out of date" : "Up to date"}
          </Alert>
          {reviewOutOfDate ? (
            <Alert severity="warning">
              Review & Approval must be regenerated after site recommendation changes.
            </Alert>
          ) : null}
          {!hasGenerated ? (
            <Alert severity="info">
              Recommendations are not generated yet. Use the button above to run them.
            </Alert>
          ) : null}
          <Typography variant="body2" color="text.secondary">
            Included sites feed Review & Approval. Recommendations never auto-approve sites and
            require explicit inclusion or exclusion.
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
};

export default SiteRecommendationPage;
