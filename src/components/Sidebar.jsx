import {
  Badge,
  Box,
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
  CheckCircleOutline,
  Lightbulb,
  RadioButtonUnchecked,
  Settings,
  TaskAlt,
} from "@mui/icons-material";

const drawerWidth = 320;

const stepIcons = {
  Incomplete: <RadioButtonUnchecked fontSize="small" />,
  "In Progress": <TaskAlt fontSize="small" />,
  Complete: <CheckCircleOutline fontSize="small" />,
};

const Sidebar = ({ navSections, activePath, onNavigate, onDisabledNavigate }) => {
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
          Scenario Workspace
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Navigation remains scoped to the active scenario.
        </Typography>
      </Box>
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
              selected={activePath.endsWith("/ai-assist")}
              onClick={() => onNavigate("ai-assist")}
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
              selected={activePath.endsWith("/settings")}
              onClick={() => onNavigate("settings")}
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
