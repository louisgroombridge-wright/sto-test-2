import {
  Alert,
  Box,
  Button,
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

const today = new Date();

const patientProfiles = [
  {
    id: "pp-1",
    name: "Refractory AML",
  },
  {
    id: "pp-2",
    name: "Older AML (65+)",
  },
];

const siteProfile = {
  name: "Global Phase II Hematology Sites",
  requirements: ["Phase II oncology experience", "Central lab access"],
};

const initialCountries = [
  {
    countryCode: "US",
    countryName: "United States",
    profileConsiderations:
      "Older AML cohort may require tertiary centers with geriatric oncology support.",
    keyConstraints: ["Competing trials", "High startup cost"],
    enrollmentAssumptions: "Academic centers can open within 10 weeks.",
    decisionStatus: "Pending",
    targetSiteCount: null,
    rationale: "",
    decidedBy: "",
    decidedAt: "",
    decisionHistory: [],
    regions: ["North America"],
  },
  {
    countryCode: "DE",
    countryName: "Germany",
    profileConsiderations:
      "AML population clustered in university hospitals; rural access is limited.",
    keyConstraints: ["Slow contracting", "Regional ethics timelines"],
    enrollmentAssumptions: "Enrollment dependent on university hospitals.",
    decisionStatus: "Pending",
    targetSiteCount: null,
    rationale: "",
    decidedBy: "",
    decidedAt: "",
    decisionHistory: [],
    regions: ["Europe"],
  },
  {
    countryCode: "BR",
    countryName: "Brazil",
    profileConsiderations:
      "Older AML referrals limited to urban referral centers with hematology focus.",
    keyConstraints: ["Import license timing", "Limited AML sites"],
    enrollmentAssumptions: "Use regional CROs for startup support.",
    decisionStatus: "Pending",
    targetSiteCount: null,
    rationale: "",
    decidedBy: "",
    decidedAt: "",
    decisionHistory: [],
    regions: ["Latin America"],
  },
  {
    countryCode: "JP",
    countryName: "Japan",
    profileConsiderations:
      "Older AML cohort is feasible in tertiary centers, with longer startup lead time.",
    keyConstraints: ["Local language requirements", "Longer startup"],
    enrollmentAssumptions: "Likely 1-2 sites with extended activation.",
    decisionStatus: "Pending",
    targetSiteCount: null,
    rationale: "",
    decidedBy: "",
    decidedAt: "",
    decisionHistory: [],
    regions: ["Asia-Pacific"],
  },
];

const formatTimestamp = (dateValue) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dateValue);

const CountrySelectionPage = () => {
  const [countries, setCountries] = useState(initialCountries);
  const [expandedRows, setExpandedRows] = useState({});
  const [decisionChanged, setDecisionChanged] = useState(false);

  const handleCountryUpdate = (countryCode, updates, actor = "J. Morgan") => {
    setCountries((prev) =>
      prev.map((country) => {
        if (country.countryCode !== countryCode) {
          return country;
        }

        const nextStatus = updates.decisionStatus ?? country.decisionStatus;
        const shouldLog = updates.decisionStatus && nextStatus !== "Pending";
        const timestamp = formatTimestamp(today);
        const historyEntry = shouldLog
          ? {
              status: nextStatus,
              decidedBy: actor,
              decidedAt: timestamp,
            }
          : null;

        return {
          ...country,
          ...updates,
          decidedBy: shouldLog ? actor : country.decidedBy,
          decidedAt: shouldLog ? timestamp : country.decidedAt,
          decisionHistory: historyEntry
            ? [...country.decisionHistory, historyEntry]
            : country.decisionHistory,
        };
      })
    );

    if (
      updates.decisionStatus !== undefined ||
      updates.targetSiteCount !== undefined ||
      updates.rationale !== undefined
    ) {
      setDecisionChanged(true);
    }
  };

  const handleTargetSiteChange = (countryCode, value) => {
    const parsed = value === "" ? null : Number(value);
    handleCountryUpdate(countryCode, { targetSiteCount: parsed });
  };

  const handleRationaleChange = (countryCode, value) => {
    handleCountryUpdate(countryCode, { rationale: value });
  };

  const handleApprove = (countryCode) => {
    handleCountryUpdate(countryCode, { decisionStatus: "Approved" });
    setExpandedRows((prev) => ({ ...prev, [countryCode]: true }));
  };

  const handleReject = (countryCode) => {
    handleCountryUpdate(countryCode, { decisionStatus: "Rejected" });
    setExpandedRows((prev) => ({ ...prev, [countryCode]: true }));
  };

  const toggleExpanded = (countryCode) => {
    setExpandedRows((prev) => ({
      ...prev,
      [countryCode]: !prev[countryCode],
    }));
  };

  // No ranking or optimization: summary is informational only and must never score countries.
  const summary = useMemo(() => {
    const approved = countries.filter(
      (country) => country.decisionStatus === "Approved"
    );
    const totalSites = approved.reduce(
      (sum, country) => sum + (country.targetSiteCount || 0),
      0
    );
    const regions = approved.flatMap((country) => country.regions);
    const uniqueRegions = [...new Set(regions)];
    const warnings = [];

    if (approved.length === 0) {
      warnings.push("No countries approved yet.");
    }
    if (totalSites > 0 && totalSites < 5) {
      warnings.push("Target site totals appear low for this profile.");
    }
    if (totalSites > 60) {
      warnings.push("Target site totals appear high for this scenario.");
    }
    if (uniqueRegions.length === 1 && approved.length > 2) {
      warnings.push("Geographic concentration is high in one region.");
    }

    return {
      approvedCount: approved.length,
      totalSites,
      regions: uniqueRegions,
      warnings,
    };
  }, [countries]);

  const validationIssues = useMemo(() => {
    const issues = [];
    const approved = countries.filter(
      (country) => country.decisionStatus === "Approved"
    );
    const rejected = countries.filter(
      (country) => country.decisionStatus === "Rejected"
    );

    if (approved.length === 0) {
      issues.push("At least one country must be approved to proceed.");
    }

    approved.forEach((country) => {
      if (!country.targetSiteCount || country.targetSiteCount <= 0) {
        issues.push(
          `${country.countryName} requires a target site count greater than zero.`
        );
      }
    });

    rejected.forEach((country) => {
      if (!country.rationale.trim()) {
        issues.push(
          `${country.countryName} requires a rejection rationale before proceeding.`
        );
      }
    });

    return issues;
  }, [countries]);

  return (
    <Box sx={{ p: 4, display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography variant="h4" component="h1" sx={{ mb: 0.5 }}>
          Country Selection
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
          Scenario Alpha • Country decisions are scenario-specific and do not
          imply global feasibility.
        </Typography>
        <Paper
          elevation={0}
          sx={{ p: 2, border: "1px solid rgba(0, 0, 0, 0.12)" }}
        >
          <Stack spacing={1}>
            <Typography variant="subtitle2">Scenario context</Typography>
            <Typography variant="body2" color="text.secondary">
              Patient Profiles: {patientProfiles.map((profile) => profile.name).join(", ")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Site Profile: {siteProfile.name}
            </Typography>
          </Stack>
        </Paper>
      </Box>

      {/* Explicit decisions only: automation or implicit inclusion is forbidden for governance. */}
      <Paper elevation={0} sx={{ p: 2, border: "1px solid rgba(0, 0, 0, 0.12)" }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Country decisions
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Every country must be explicitly approved or rejected. Automated ranking
          or optimization is forbidden; decisions are deliberate and documented.
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Country</TableCell>
              <TableCell>Patient profile considerations</TableCell>
              <TableCell>Key constraints</TableCell>
              <TableCell>Enrollment assumptions</TableCell>
              <TableCell>Decision</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {countries.map((country) => {
              const needsTargetSites =
                country.decisionStatus === "Approved" &&
                (!country.targetSiteCount || country.targetSiteCount <= 0);
              const needsRationale =
                country.decisionStatus === "Rejected" &&
                !country.rationale.trim();
              const expanded =
                expandedRows[country.countryCode] ||
                country.decisionStatus !== "Pending";

              return (
                <>
                  <TableRow key={country.countryCode} hover>
                    <TableCell sx={{ minWidth: 180 }}>
                      <Typography variant="subtitle2">{country.countryName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {country.countryCode}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        This country will not be included unless approved.
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ minWidth: 240 }}>
                      <Typography variant="body2">
                        {country.profileConsiderations}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Notes reflect patient profile context, not a score.
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ minWidth: 210 }}>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {country.keyConstraints.map((constraint) => (
                          <Chip
                            key={constraint}
                            size="small"
                            label={constraint}
                            variant="outlined"
                            sx={{ mb: 0.5 }}
                          />
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ minWidth: 240 }}>
                      <Typography variant="body2">
                        {country.enrollmentAssumptions}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ minWidth: 200 }}>
                      <Stack spacing={1} alignItems="flex-start">
                        <Chip label={`Status: ${country.decisionStatus}`} size="small" />
                        <Button size="small" variant="text" onClick={() => toggleExpanded(country.countryCode)}>
                          {expanded ? "Hide decision" : "Review decision"}
                        </Button>
                        <Typography variant="caption" color="text.secondary">
                          {country.decidedAt
                            ? `Last decision by ${country.decidedBy} on ${country.decidedAt}`
                            : "No decision recorded yet."}
                        </Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={5} sx={{ p: 0, borderBottom: 0 }}>
                      <Collapse in={expanded} timeout="auto" unmountOnExit>
                        <Box
                          sx={{
                            px: 2,
                            py: 2,
                            borderTop: "1px solid rgba(0, 0, 0, 0.08)",
                            backgroundColor: "rgba(0, 0, 0, 0.02)",
                          }}
                        >
                          <Stack spacing={2}>
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                              <Button
                                size="small"
                                variant="contained"
                                onClick={() => handleApprove(country.countryCode)}
                              >
                                Approve
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={() => handleReject(country.countryCode)}
                              >
                                Reject
                              </Button>
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                Decisions are recorded explicitly; no automatic inclusion occurs.
                              </Typography>
                            </Stack>

                            {country.decisionStatus === "Approved" ? (
                              <Box>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                  How many sites do you intend to activate in this country?
                                </Typography>
                                <TextField
                                  type="number"
                                  size="small"
                                  value={country.targetSiteCount ?? ""}
                                  onChange={(event) =>
                                    handleTargetSiteChange(
                                      country.countryCode,
                                      event.target.value
                                    )
                                  }
                                  error={needsTargetSites}
                                  helperText={
                                    needsTargetSites
                                      ? "Target site count is required for approvals."
                                      : ""
                                  }
                                  inputProps={{ min: 0 }}
                                />
                              </Box>
                            ) : null}

                            {country.decisionStatus === "Rejected" ? (
                              <Box>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                  Rejection rationale
                                </Typography>
                                <TextField
                                  multiline
                                  minRows={3}
                                  fullWidth
                                  value={country.rationale}
                                  onChange={(event) =>
                                    handleRationaleChange(
                                      country.countryCode,
                                      event.target.value
                                    )
                                  }
                                  error={needsRationale}
                                  helperText={
                                    needsRationale
                                      ? "Rejection requires a documented reason."
                                      : ""
                                  }
                                />
                              </Box>
                            ) : null}

                            {country.decisionStatus === "Pending" ? (
                              <Typography variant="body2" color="text.secondary">
                                This country remains pending until a decision is recorded.
                              </Typography>
                            ) : null}
                          </Stack>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </>
              );
            })}
          </TableBody>
        </Table>
      </Paper>

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: "2fr 1fr" }}>
        <Paper
          elevation={0}
          sx={{ p: 2, border: "1px solid rgba(0, 0, 0, 0.12)" }}
        >
          <Typography variant="h6" sx={{ mb: 1 }}>
            Validation & flow control
          </Typography>
          <Stack spacing={1.5}>
            <Alert severity={decisionChanged ? "warning" : "info"}>
              Downstream Site Recommendation step: {decisionChanged ? "Out of date" : "Up to date"}
            </Alert>
            {decisionChanged ? (
              <Alert severity="warning">
                Site recommendations must be regenerated after country changes.
              </Alert>
            ) : null}
            {validationIssues.length > 0 ? (
              <Alert severity="error">
                <Stack component="ul" sx={{ pl: 2, mb: 0 }}>
                  {validationIssues.map((issue) => (
                    <li key={issue}>
                      <Typography variant="body2">{issue}</Typography>
                    </li>
                  ))}
                </Stack>
              </Alert>
            ) : (
              <Alert severity="success">All required decisions are complete.</Alert>
            )}
            <Typography variant="body2" color="text.secondary">
              Decisions here invalidate downstream site recommendations; no automatic recomputation
              occurs until the next step is manually refreshed.
            </Typography>
          </Stack>
        </Paper>

        <Paper
          elevation={0}
          sx={{ p: 2, border: "1px solid rgba(0, 0, 0, 0.12)" }}
        >
          <Typography variant="h6" sx={{ mb: 1 }}>
            Footprint summary
          </Typography>
          <Stack spacing={1}>
            <Typography variant="body2">
              Approved countries: <strong>{summary.approvedCount}</strong>
            </Typography>
            <Typography variant="body2">
              Total target sites: <strong>{summary.totalSites}</strong>
            </Typography>
            <Typography variant="body2">
              Regions represented: {summary.regions.length ? summary.regions.join(", ") : "None"}
            </Typography>
            <Divider />
            {summary.warnings.length > 0 ? (
              <Stack spacing={0.5}>
                {summary.warnings.map((warning) => (
                  <Typography key={warning} variant="caption" color="warning.main">
                    {warning}
                  </Typography>
                ))}
              </Stack>
            ) : (
              <Typography variant="caption" color="text.secondary">
                No footprint warnings.
              </Typography>
            )}
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
};

export default CountrySelectionPage;
