import { RuleContext } from '@alfresco/adf-extensions';
import { CM_OWNER_PROP_NAME } from '../models/ek-project.model';

/**
 * Evaluate if current user can take ownership of the node
 */
export function canTakeOwnership(context: RuleContext): boolean {

  // Get the selected file or folder node
  const node = context.selection.file ? context.selection.file : context.selection.folder;

  // We cannot take ownership if we don't have a node
  if (!node || !node.entry) {
    return false;
  }

  // Can only take ownership if current user has admin rights
  if (node.entry.properties && node.entry.properties[CM_OWNER_PROP_NAME]) {
    const owner = node.entry.properties[CM_OWNER_PROP_NAME];
    return context.profile.isAdmin && owner.id != context.profile.id;
  } else {
    return context.profile.isAdmin;
  }
}
