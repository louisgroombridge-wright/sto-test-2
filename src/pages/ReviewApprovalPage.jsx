import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";

const formatTimestamp = () =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());

const ReviewApprovalPage = ({
  shortlist,
  auditLog,
  onAddToShortlist,
  onRemoveFromShortlist,
  onUpdateShortlistNote,
  onRecordShortlistAction,
}) => {
  const { scenarioId } = useParams();
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [activeSiteId, setActiveSiteId] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addDraft, setAddDraft] = useState({
    siteName: "",
    country: "",
    city: "",
  });

  const sharedLink = useMemo(() => {
    if (typeof window === "undefined") {
      return "https://example.com/scenarios/scenario-id/site-recommendation/shared";
    }
    return `${window.location.origin}/scenarios/${scenarioId}/site-recommendation/shared`;
  }, [scenarioId]);

  const handleOpenNoteDialog = (siteId) => {
    const site = shortlist.find((item) => item.siteId === siteId);
    setNoteDraft(site?.notes ?? "");
    setActiveSiteId(siteId);
    setNoteDialogOpen(true);
  };

  const handleSaveNote = () => {
    onUpdateShortlistNote(activeSiteId, noteDraft);
    const site = shortlist.find((item) => item.siteId === activeSiteId);
    if (site) {
      onRecordShortlistAction({
        action: "Note Updated",
        site,
        source: "Review & Approval",
      });
    }
    setNoteDialogOpen(false);
  };

  const handleRemove = (site) => {
    onRemoveFromShortlist(site.siteId);
    onRecordShortlistAction({
      action: "Removed",
      site,
      source: "Review & Approval",
    });
  };

  const handleAddSite = () => {
    if (!addDraft.siteName.trim()) {
      return;
    }
    const newSite = {
      siteId: `manual-${Date.now()}`,
      siteName: addDraft.siteName.trim(),
      country: addDraft.country.trim() || "Unknown",
      city: addDraft.city.trim() || "Unknown",
      historicalEnrollmentRate: "Unknown",
      timeToFirstPatient: "Unknown",
      siteActivationTime: "Unknown",
      screeningSuccessRate: "Unknown",
      dropoutRate: "Unknown",
      priorTrialExperience: "Unknown",
      competitiveTrialOverlap: "Unknown",
      compositeSiteScore: "Manual",
      niceToHaveCriteriaMet: "Unknown",
      createdBy: "You",
      updatedBy: "You",
      decisionStatus: "Pending",
      decisionBy: "",
      decisionAt: "",
      notes: "",
      addedAt: formatTimestamp(),
      addedBy: "You",
    };
    onAddToShortlist(newSite);
    onRecordShortlistAction({
      action: "Added",
      site: newSite,
      source: "Review & Approval",
    });
    setAddDraft({ siteName: "", country: "", city: "" });
    setAddDialogOpen(false);
  };

  return (
    <Box sx={{ p: 4, display: "flex", flexDirection: "column", gap: 3 }}>
      <Paper elevation={0} sx={{ border: "1px solid rgba(0, 0, 0, 0.12)", p: 3 }}>
        <Stack spacing={1}>
          <Typography variant="h5">Review & Approval</Typography>
          <Typography variant="body2" color="text.secondary">
            Review the scenario shortlist and finalize decisions before sharing externally.
          </Typography>
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ border: "1px solid rgba(0, 0, 0, 0.12)", p: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
          <Button variant="contained" onClick={() => setShareDialogOpen(true)}>
            Share for Review
          </Button>
          <Button variant="outlined" onClick={() => setAddDialogOpen(true)}>
            Add site
          </Button>
          {/* Review & Approval is the single source of truth for the shortlist. */}
          <Typography variant="body2" color="text.secondary">
            Shortlisted sites are reviewed here, not inside the discovery workflow.
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
              {shortlist.map((site) => (
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
                      <Button size="small" onClick={() => handleRemove(site)}>
                        Remove
                      </Button>
                      <Button size="small" onClick={() => handleOpenNoteDialog(site.siteId)}>
                        Add note
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {shortlist.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={15}>
                    <Typography variant="body2" color="text.secondary">
                      No sites shortlisted yet. Add sites from the Site Recommendation tab.
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
          Shortlist activity
        </Typography>
        <Stack spacing={1}>
          {auditLog.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No shortlist actions recorded yet.
            </Typography>
          ) : (
            auditLog.map((entry) => (
              <Card key={entry.id} variant="outlined">
                <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                  <Typography variant="subtitle2">
                    {entry.action} • {entry.siteName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {entry.timestamp} • {entry.user} • {entry.source}
                  </Typography>
                </CardContent>
              </Card>
            ))
          )}
        </Stack>
      </Paper>

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

      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add site to shortlist</DialogTitle>
        <DialogContent sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Site name"
            value={addDraft.siteName}
            onChange={(event) => setAddDraft((prev) => ({ ...prev, siteName: event.target.value }))}
            required
          />
          <TextField
            label="Country"
            value={addDraft.country}
            onChange={(event) => setAddDraft((prev) => ({ ...prev, country: event.target.value }))}
          />
          <TextField
            label="City"
            value={addDraft.city}
            onChange={(event) => setAddDraft((prev) => ({ ...prev, city: event.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddSite}>
            Add site
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReviewApprovalPage;
