import {
  Box,
  Chip,
  Checkbox,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import InfoOutlined from "@mui/icons-material/InfoOutlined";

const initialCountries = [
  {
    id: "country-us",
    name: "United States",
    totalSites: 120,
    ethnicities: ["White 59%", "Black 13%", "Hispanic 19%"],
    selected: true,
    lastChangedAt: "2024-05-18 09:12",
    lastChangedBy: "J. Rivera",
    dataSource: "Global feasibility registry",
  },
  {
    id: "country-de",
    name: "Germany",
    totalSites: 45,
    ethnicities: ["White 74%", "Turkish 5%", "Other 21%"],
    selected: false,
    lastChangedAt: "2024-05-17 16:40",
    lastChangedBy: "M. Patel",
    dataSource: "EU trial consortium",
  },
  {
    id: "country-br",
    name: "Brazil",
    totalSites: 38,
    ethnicities: ["White 47%", "Black 8%", "Mixed 43%"],
    selected: true,
    lastChangedAt: "2024-05-16 11:05",
    lastChangedBy: "S. Nguyen",
    dataSource: "LATAM feasibility snapshot",
  },
  {
    id: "country-jp",
    name: "Japan",
    totalSites: 28,
    ethnicities: ["Japanese 97%", "Other 3%"],
    selected: false,
    lastChangedAt: "2024-05-15 13:22",
    lastChangedBy: "L. Gomez",
    dataSource: "APAC trial registry",
  },
  {
    id: "country-au",
    name: "Australia",
    totalSites: 22,
    ethnicities: ["White 75%", "Asian 17%", "Indigenous 3%"],
    selected: false,
    lastChangedAt: "2024-05-19 08:55",
    lastChangedBy: "E. Carter",
    dataSource: "ANZ feasibility benchmark",
  },
];

const formatTimestamp = () =>
  new Date().toISOString().slice(0, 16).replace("T", " ");

const CountrySelectionPage = () => {
  const [countries, setCountries] = useState(initialCountries);
  const [searchValue, setSearchValue] = useState("");
  const [targetTotalSites, setTargetTotalSites] = useState(180);

  const filteredCountries = useMemo(() => {
    const normalized = searchValue.trim().toLowerCase();
    if (!normalized) {
      return countries;
    }
    return countries.filter((country) =>
      country.name.toLowerCase().includes(normalized)
    );
  }, [countries, searchValue]);

  const summary = useMemo(() => {
    const selectedCountries = countries.filter((country) => country.selected);
    const totalSites = selectedCountries.reduce(
      (sum, country) => sum + country.totalSites,
      0
    );
    return {
      selectedCount: selectedCountries.length,
      totalSites,
      targetDelta: targetTotalSites - totalSites,
    };
  }, [countries, targetTotalSites]);

  const handleToggleCountry = (countryId) => {
    setCountries((prev) =>
      prev.map((country) =>
        country.id === countryId
          ? {
              ...country,
              selected: !country.selected,
              lastChangedAt: formatTimestamp(),
              lastChangedBy: "Current User",
            }
          : country
      )
    );
  };

  const handleTargetSitesChange = (event) => {
    const value = event.target.value;
    const parsed = Number(value);
    if (Number.isNaN(parsed) || parsed < 0) {
      return;
    }
    setTargetTotalSites(parsed);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Stack spacing={3}>
        <Toolbar
          disableGutters
          sx={{
            px: 2,
            py: 1.5,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <TextField
            placeholder="Search countries"
            size="small"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            sx={{ minWidth: 240 }}
          />
          <TextField
            label="Target total sites"
            type="number"
            size="small"
            value={targetTotalSites}
            onChange={handleTargetSitesChange}
            inputProps={{ min: 0 }}
            sx={{ width: 200 }}
          />
        </Toolbar>

        <Paper sx={{ p: 2 }}>
          {/* Selection workspace only; no rankings or automated recommendations. */}
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">Select</TableCell>
                  <TableCell>Country Name</TableCell>
                  <TableCell>Total Sites</TableCell>
                  <TableCell>Ethnicity %'s</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCountries.map((country) => (
                  <TableRow key={country.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={country.selected}
                        onChange={() => handleToggleCountry(country.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Typography variant="subtitle2">{country.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Last updated {country.lastChangedAt} by {country.lastChangedBy}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{country.totalSites}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {country.ethnicities.map((ethnicity) => (
                          <Chip key={ethnicity} label={ethnicity} size="small" />
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={`Data source: ${country.dataSource}`}>
                        <InfoOutlined fontSize="small" color="action" />
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Paper sx={{ p: 2 }}>
          {/* Summary stays informational to avoid decision logic. */}
          <Stack spacing={1}>
            <Typography variant="subtitle1">Selection summary</Typography>
            <Typography variant="body2">
              Selected countries: <strong>{summary.selectedCount}</strong>
            </Typography>
            <Typography variant="body2">
              Aggregate total sites: <strong>{summary.totalSites}</strong>
            </Typography>
            <Typography variant="body2">
              Target total sites: <strong>{targetTotalSites}</strong> ({
              summary.targetDelta >= 0
                ? `${summary.targetDelta} sites remaining`
                : `${Math.abs(summary.targetDelta)} sites over target`}
              )
            </Typography>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
};

export default CountrySelectionPage;
