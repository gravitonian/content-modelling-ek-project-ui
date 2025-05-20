import { RuleContext } from '@alfresco/adf-extensions';

/**
 * Evaluate if current user can create Client/Supplier Profile items in current folder.
 */
export function isClientSupplierProfileFolder(context: RuleContext): boolean {
  // First check if we have selected (right clicked) the folder node
  const selectedNode = context.selection.folder?.entry;
  // We could also be in the details page of the folder
  const currentNode = context.navigation.currentFolder;

 // Compare with the Supplier & Client profiles folder name.
 // (hard coded here, we could also compare id if we think name will change...)
  const targetName = 'Supplier & Client profiles';

  return selectedNode?.name === targetName || currentNode?.name === targetName;
}

