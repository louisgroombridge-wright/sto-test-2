import {
  Box,
  Chip,
  Checkbox,
  Collapse,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Popover,
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
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import FilterListIcon from "@mui/icons-material/FilterList";

const initialCountries = [
  {
    id: "country-us",
    name: "United States",
    region: "North America",
    totalSites: 120,
    ethnicities: ["White 59%", "Black 13%", "Hispanic 19%"],
    ethnicityBands: ["High diversity", "Multiple minority groups"],
    selected: true,
    lastChangedAt: "2024-05-18 09:12",
    lastChangedBy: "J. Rivera",
    dataSource: "Global feasibility registry",
  },
  {
    id: "country-de",
    name: "Germany",
    region: "Europe",
    totalSites: 45,
    ethnicities: ["White 74%", "Turkish 5%", "Other 21%"],
    ethnicityBands: ["Majority single group"],
    selected: false,
    lastChangedAt: "2024-05-17 16:40",
    lastChangedBy: "M. Patel",
    dataSource: "EU trial consortium",
  },
  {
    id: "country-br",
    name: "Brazil",
    region: "Latin America",
    totalSites: 38,
    ethnicities: ["White 47%", "Black 8%", "Mixed 43%"],
    ethnicityBands: ["High diversity", "Mixed majority"],
    selected: true,
    lastChangedAt: "2024-05-16 11:05",
    lastChangedBy: "S. Nguyen",
    dataSource: "LATAM feasibility snapshot",
  },
  {
    id: "country-jp",
    name: "Japan",
    region: "Asia-Pacific",
    totalSites: 28,
    ethnicities: ["Japanese 97%", "Other 3%"],
    ethnicityBands: ["Majority single group"],
    selected: false,
    lastChangedAt: "2024-05-15 13:22",
    lastChangedBy: "L. Gomez",
    dataSource: "APAC trial registry",
  },
  {
    id: "country-au",
    name: "Australia",
    region: "Asia-Pacific",
    totalSites: 22,
    ethnicities: ["White 75%", "Asian 17%", "Indigenous 3%"],
    ethnicityBands: ["Moderate diversity"],
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
  const [filters, setFilters] = useState({
    region: [],
    totalSites: { min: "", max: "" },
    ethnicityBands: [],
  });
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [filterAnchor, setFilterAnchor] = useState({ column: "", anchorEl: null });

  const filteredCountries = useMemo(() => {
    const normalized = searchValue.trim().toLowerCase();
    const matchesRange = (value, range) => {
      const min = range.min !== "" ? Number(range.min) : null;
      const max = range.max !== "" ? Number(range.max) : null;
      if (min !== null && value < min) {
        return false;
      }
      if (max !== null && value > max) {
        return false;
      }
      return true;
    };
    return countries.filter((country) => {
      const matchesSearch =
        !normalized ||
        [country.name, country.region]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalized));
      const matchesRegion =
        filters.region.length === 0 || filters.region.includes(country.region);
      const matchesTotalSites = matchesRange(country.totalSites, filters.totalSites);
      const matchesEthnicity =
        filters.ethnicityBands.length === 0 ||
        filters.ethnicityBands.some((band) => country.ethnicityBands.includes(band));
      return matchesSearch && matchesRegion && matchesTotalSites && matchesEthnicity;
    });
  }, [countries, filters, searchValue]);

  const sortedCountries = useMemo(() => {
    if (!sortConfig.key) {
      return filteredCountries;
    }
    const sorted = [...filteredCountries];
    const direction = sortConfig.direction === "asc" ? 1 : -1;
    sorted.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (typeof aValue === "number" && typeof bValue === "number") {
        return (aValue - bValue) * direction;
      }
      return `${aValue}`.localeCompare(`${bValue}`) * direction;
    });
    return sorted;
  }, [filteredCountries, sortConfig]);

  const summary = useMemo(() => {
    const selectedCountries = countries.filter((country) => country.selected);
    const totalSites = selectedCountries.reduce(
      (sum, country) => sum + country.totalSites,
      0
    );
    return {
      selectedCount: selectedCountries.length,
      totalSites,
    };
  }, [countries]);

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

  const selectedCountries = useMemo(
    () => countries.filter((country) => country.selected),
    [countries]
  );

  const regionOptions = useMemo(
    () => Array.from(new Set(countries.map((country) => country.region))),
    [countries]
  );

  const ethnicityBandOptions = useMemo(
    () =>
      Array.from(
        new Set(countries.flatMap((country) => country.ethnicityBands))
      ),
    [countries]
  );

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

  const handleFilterChange = (columnKey, value) => {
    setFilters((prev) => ({
      ...prev,
      [columnKey]: value,
    }));
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

  const handleClearFilters = () => {
    setFilters({
      region: [],
      totalSites: { min: "", max: "" },
      ethnicityBands: [],
    });
    setSearchValue("");
  };

  return (
    <Box sx={{ p: 4 }}>
      <Stack spacing={3}>
        <Collapse in={selectedCountries.length > 0} unmountOnExit>
          <Paper sx={{ p: 2 }}>
            <Stack spacing={1.5}>
              <Typography variant="subtitle1">Selected Countries</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {selectedCountries.map((country) => (
                  <Chip
                    key={country.id}
                    label={country.name}
                    onDelete={() => handleToggleCountry(country.id)}
                  />
                ))}
              </Stack>
              {/* Selection is explicit and visible to avoid hidden decision logic. */}
            </Stack>
          </Paper>
        </Collapse>

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
            placeholder="Search countries…"
            size="small"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            sx={{ minWidth: 240 }}
          />
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton
              size="small"
              onClick={(event) => handleOpenFilter(event, "region")}
              color={filters.region.length > 0 ? "primary" : "default"}
            >
              <FilterListIcon fontSize="small" />
            </IconButton>
            <Typography variant="body2">Region</Typography>
            <IconButton
              size="small"
              onClick={(event) => handleOpenFilter(event, "totalSites")}
              color={
                filters.totalSites.min !== "" || filters.totalSites.max !== ""
                  ? "primary"
                  : "default"
              }
            >
              <FilterListIcon fontSize="small" />
            </IconButton>
            <Typography variant="body2">Total Sites</Typography>
            <IconButton
              size="small"
              onClick={(event) => handleOpenFilter(event, "ethnicityBands")}
              color={filters.ethnicityBands.length > 0 ? "primary" : "default"}
            >
              <FilterListIcon fontSize="small" />
            </IconButton>
            <Typography variant="body2">Ethnicity Bands</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              Filters only affect the table, never auto-select.
            </Typography>
          </Stack>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ cursor: "pointer" }}
            onClick={handleClearFilters}
          >
            Clear filters
          </Typography>
        </Toolbar>

        <Paper sx={{ p: 2 }}>
          {/* Selection workspace only; no rankings or automated recommendations. */}
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">Add / Remove</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortConfig.key === "name"}
                      direction={sortConfig.key === "name" ? sortConfig.direction : "asc"}
                      onClick={() => handleSortRequest("name")}
                    >
                      Country Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Region</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortConfig.key === "totalSites"}
                      direction={sortConfig.key === "totalSites" ? sortConfig.direction : "asc"}
                      onClick={() => handleSortRequest("totalSites")}
                    >
                      Total Sites
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Ethnicity %'s</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedCountries.map((country) => (
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
                    <TableCell>{country.region}</TableCell>
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
          </Stack>
        </Paper>
      </Stack>

      <Popover
        open={Boolean(filterAnchor.anchorEl)}
        anchorEl={filterAnchor.anchorEl}
        onClose={handleCloseFilter}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Box sx={{ p: 2, minWidth: 240 }}>
          {filterAnchor.column === "region" ? (
            <FormControl size="small" fullWidth>
              <InputLabel id="region-filter-label">Region</InputLabel>
              <Select
                labelId="region-filter-label"
                label="Region"
                multiple
                value={filters.region}
                onChange={(event) => handleFilterChange("region", event.target.value)}
                renderValue={(selected) => selected.join(", ")}
              >
                {regionOptions.map((region) => (
                  <MenuItem key={region} value={region}>
                    <Checkbox checked={filters.region.includes(region)} />
                    <Typography variant="body2">{region}</Typography>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : null}
          {filterAnchor.column === "totalSites" ? (
            <Stack spacing={2}>
              <TextField
                label="Min"
                type="number"
                size="small"
                value={filters.totalSites.min}
                onChange={(event) => handleRangeFilterChange("totalSites", "min", event.target.value)}
              />
              <TextField
                label="Max"
                type="number"
                size="small"
                value={filters.totalSites.max}
                onChange={(event) => handleRangeFilterChange("totalSites", "max", event.target.value)}
              />
            </Stack>
          ) : null}
          {filterAnchor.column === "ethnicityBands" ? (
            <FormControl size="small" fullWidth>
              <InputLabel id="ethnicity-filter-label">Ethnicity bands</InputLabel>
              <Select
                labelId="ethnicity-filter-label"
                label="Ethnicity bands"
                multiple
                value={filters.ethnicityBands}
                onChange={(event) => handleFilterChange("ethnicityBands", event.target.value)}
                renderValue={(selected) => selected.join(", ")}
              >
                {ethnicityBandOptions.map((band) => (
                  <MenuItem key={band} value={band}>
                    <Checkbox checked={filters.ethnicityBands.includes(band)} />
                    <Typography variant="body2">{band}</Typography>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : null}
        </Box>
      </Popover>
    </Box>
  );
};

export default CountrySelectionPage;
