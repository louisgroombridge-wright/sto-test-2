import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useMemo, useState } from "react";

const statusColors = {
  Draft: "default",
  "In Review": "warning",
  Locked: "success",
};

const formatDate = (value) => {
  if (!value) {
    return "—";
  }
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const ScenarioCard = ({ scenario, onOpen }) => {
  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardActionArea onClick={() => onOpen(scenario.id)} sx={{ height: "100%" }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {scenario.name}
              </Typography>
              {scenario.description ? (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {scenario.description}
                </Typography>
              ) : null}
            </Box>
            <Chip
              size="small"
              label={scenario.status}
              color={statusColors[scenario.status] || "default"}
              variant="outlined"
            />
          </Stack>
          <Divider sx={{ my: 1.5 }} />
          <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary">
              Last modified: {formatDate(scenario.updatedAt)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Created by: {scenario.createdBy}
            </Typography>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

const ScenarioHubPage = ({ scenarios, onCreateScenario, onOpenScenario }) => {
  const [createOpen, setCreateOpen] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftDescription, setDraftDescription] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const recentScenarios = useMemo(() => {
    return [...scenarios]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 4);
  }, [scenarios]);

  const filteredScenarios = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return scenarios;
    }
    return scenarios.filter((scenario) =>
      [scenario.name, scenario.description, scenario.createdBy]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [scenarios, searchQuery]);

  const handleOpenCreate = () => setCreateOpen(true);
  const handleCloseCreate = () => {
    setCreateOpen(false);
    setDraftName("");
    setDraftDescription("");
  };

  const handleCreateScenario = () => {
    if (!draftName.trim()) {
      return;
    }
    onCreateScenario({
      name: draftName.trim(),
      description: draftDescription.trim(),
    });
    handleCloseCreate();
  };

  return (
    <Box sx={{ backgroundColor: "#f6f7fb", minHeight: "100vh" }}>
      {/* Scenario hub is intentionally a launchpad: users enter a scenario before any work begins. */}
      <Box
        sx={{
          px: { xs: 3, md: 8 },
          pt: { xs: 6, md: 8 },
          pb: { xs: 4, md: 6 },
        }}
      >
        <Box
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            background:
              "linear-gradient(135deg, rgba(25,118,210,0.12), rgba(13,71,161,0.05))",
            border: "1px solid rgba(25, 118, 210, 0.12)",
          }}
        >
          <Typography variant="overline" color="text.secondary">
            Scenario Hub
          </Typography>
          <Typography variant="h3" sx={{ mt: 1, mb: 1, fontWeight: 600 }}>
            Enter a feasibility scenario
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 520 }}>
            Create a new feasibility scenario to explore patient profiles, countries,
            and site options for a potential study.
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{ mt: 3 }}
            onClick={handleOpenCreate}
          >
            + Create New Scenario
          </Button>
        </Box>

        <Box sx={{ mt: 6 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Recent scenarios
          </Typography>
          <Grid container spacing={2}>
            {recentScenarios.map((scenario) => (
              <Grid item xs={12} md={6} lg={3} key={scenario.id}>
                <ScenarioCard scenario={scenario} onOpen={onOpenScenario} />
              </Grid>
            ))}
            {recentScenarios.length === 0 ? (
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      No scenarios yet. Start by creating your first feasibility
                      scenario above.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ) : null}
          </Grid>
        </Box>

        <Box sx={{ mt: 4 }}>
          <Accordion elevation={0} sx={{ border: "1px solid rgba(0, 0, 0, 0.12)" }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">All scenarios</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  label="Search scenarios"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
                <Grid container spacing={2}>
                  {filteredScenarios.map((scenario) => (
                    <Grid item xs={12} md={6} key={scenario.id}>
                      <ScenarioCard scenario={scenario} onOpen={onOpenScenario} />
                    </Grid>
                  ))}
                  {filteredScenarios.length === 0 ? (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        No scenarios match this filter.
                      </Typography>
                    </Grid>
                  ) : null}
                </Grid>
              </Box>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>

      {createOpen ? (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(15, 23, 42, 0.45)",
            zIndex: 1200,
            p: 2,
          }}
        >
          <Card sx={{ width: "100%", maxWidth: 520 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Create a new scenario
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Every action happens inside a scenario, so we create it first.
              </Typography>
              <Stack spacing={2}>
                <TextField
                  required
                  label="Scenario Name"
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                  error={!draftName.trim()}
                  helperText={!draftName.trim() ? "Scenario name is required." : ""}
                />
                <TextField
                  label="Description (optional)"
                  value={draftDescription}
                  onChange={(event) => setDraftDescription(event.target.value)}
                  multiline
                  minRows={3}
                />
              </Stack>
              <Stack direction="row" spacing={1} sx={{ mt: 3, justifyContent: "flex-end" }}>
                <Button onClick={handleCloseCreate}>Cancel</Button>
                <Button variant="contained" onClick={handleCreateScenario}>
                  Create & Open
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      ) : null}
    </Box>
  );
};

export default ScenarioHubPage;
