import {
  Badge,
  Box,
  Chip,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Add,
  CheckCircleOutline,
  ContentCopy,
  Lightbulb,
  RadioButtonUnchecked,
  Settings,
  TaskAlt,
} from "@mui/icons-material";

const drawerWidth = 320;

const statusColors = {
  Draft: "default",
  Reviewed: "info",
  Approved: "success",
};

const stepIcons = {
  Incomplete: <RadioButtonUnchecked fontSize="small" />,
  "In Progress": <TaskAlt fontSize="small" />,
  Complete: <CheckCircleOutline fontSize="small" />,
};

const Sidebar = ({
  scenarios,
  activeScenarioId,
  onScenarioSelect,
  navSections,
  activePath,
  onNavigate,
  onDisabledNavigate,
}) => {
  const handleItemClick = (item) => {
    if (!item.enabled) {
      onDisabledNavigate();
      return;
    }
    onNavigate(item.path);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          borderRight: "1px solid rgba(0, 0, 0, 0.08)",
        },
      }}
    >
      <Box sx={{ px: 2, py: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Scenarios
        </Typography>
      </Box>
      <List dense>
        {scenarios.map((scenario) => {
          const isActive = scenario.id === activeScenarioId;
          return (
            <ListItem key={scenario.id} disablePadding>
              <ListItemButton
                selected={isActive}
                onClick={() => onScenarioSelect(scenario.id)}
                sx={{
                  mx: 1,
                  mb: 0.5,
                  borderRadius: 1,
                  alignItems: "flex-start",
                  "&.Mui-selected": {
                    backgroundColor: "rgba(25, 118, 210, 0.08)",
                  },
                }}
              >
                <ListItemText
                  primary={scenario.name}
                  secondary={
                    <Chip
                      size="small"
                      label={scenario.status}
                      color={statusColors[scenario.status] || "default"}
                      variant="outlined"
                    />
                  }
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <List dense>
        <ListItem disablePadding>
          <ListItemButton sx={{ mx: 1, borderRadius: 1 }}>
            <ListItemIcon>
              <Add fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="+ New Scenario" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton sx={{ mx: 1, borderRadius: 1 }}>
            <ListItemIcon>
              <ContentCopy fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Duplicate Scenario" />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider sx={{ my: 1 }} />
      {navSections.map((section, index) => (
        <Box key={section.label} sx={{ px: 2, pb: 1 }}>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ pt: index === 0 ? 0 : 1 }}
          >
            {section.label}
          </Typography>
          <List dense>
            {section.items.map((item) => {
              const isActive = activePath === item.path;
              const tooltipTitle = item.enabled ? "" : item.disabledReason;
              return (
                <ListItem key={item.path} disablePadding>
                  <Tooltip
                    title={tooltipTitle}
                    placement="right"
                    arrow
                    disableHoverListener={item.enabled}
                  >
                    <span
                      style={{ display: "block", width: "100%" }}
                      onClick={() => {
                        if (!item.enabled) {
                          handleItemClick(item);
                        }
                      }}
                    >
                      <ListItemButton
                        disabled={!item.enabled}
                        onClick={() => handleItemClick(item)}
                        selected={isActive}
                        sx={{
                          borderRadius: 1,
                          my: 0.5,
                          "&.Mui-selected": {
                            backgroundColor: "rgba(25, 118, 210, 0.08)",
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          {item.icon === "status" ? (
                            <Badge
                              color="primary"
                              variant="dot"
                              invisible={item.status === "Complete"}
                              overlap="circular"
                            >
                              {stepIcons[item.status]}
                            </Badge>
                          ) : (
                            item.icon
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.label}
                          secondary={item.status}
                        />
                      </ListItemButton>
                    </span>
                  </Tooltip>
                </ListItem>
              );
            })}
          </List>
        </Box>
      ))}
      <Divider sx={{ mt: "auto" }} />
      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Utilities
        </Typography>
        <List dense>
          <ListItem disablePadding>
            <ListItemButton
              selected={activePath === "/ai-assist"}
              onClick={() => onNavigate("/ai-assist")}
              sx={{ borderRadius: 1, my: 0.5 }}
            >
              <ListItemIcon>
                <Lightbulb fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="AI Assist" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              selected={activePath === "/settings"}
              onClick={() => onNavigate("/settings")}
              sx={{ borderRadius: 1, my: 0.5 }}
            >
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
