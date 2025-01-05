import { Permission } from "../backend-types";

export const RolesMapping: {
    [key: string]: Permission;
} = {
  "Create global templates": "create_global_templates",
  "Create templates": "create_templates",
  "Get all roles": "get_all_roles",
  "Get all users": "get_all_users",
  "Get global templates": "get_global_templates",
  "Get templates": "get_templates"
};