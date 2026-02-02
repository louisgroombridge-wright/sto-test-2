import { Box, Button, Paper, Typography } from "@mui/material";

const PlaceholderPage = ({
  title,
  description,
  unsavedChanges,
  onToggleUnsaved,
  notice,
}) => {
  return (
    <Box sx={{ p: 4 }}>
      {notice ? (
        <Paper
          elevation={0}
          sx={{
            mb: 3,
            p: 2,
            border: "1px solid rgba(0, 0, 0, 0.12)",
            backgroundColor: "rgba(255, 167, 38, 0.08)",
          }}
        >
          <Typography variant="subtitle2" color="text.primary">
            {notice}
          </Typography>
        </Paper>
      ) : null}
      <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {description}
      </Typography>
      <Paper
        elevation={0}
        sx={{ p: 2, border: "1px solid rgba(0, 0, 0, 0.12)" }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Draft workspace
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Use this area to capture form inputs, data tables, and review content
          for the selected scenario.
        </Typography>
        <Button variant="outlined" onClick={onToggleUnsaved}>
          {unsavedChanges ? "Mark as Saved" : "Simulate Unsaved Changes"}
        </Button>
      </Paper>
    </Box>
  );
};

export default PlaceholderPage;
