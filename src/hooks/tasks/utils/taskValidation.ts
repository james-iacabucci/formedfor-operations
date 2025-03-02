
import { CreateTaskInput, UpdateTaskInput } from "@/types/task";

/**
 * Validates that a task has only one related entity
 */
export function validateSingleRelatedEntity(
  sculptureId: string | null | undefined,
  clientId: string | null | undefined, 
  orderId: string | null | undefined, 
  leadId: string | null | undefined
): void {
  const entityCount = [
    sculptureId, 
    clientId, 
    orderId, 
    leadId
  ].filter(Boolean).length;
  
  if (entityCount > 1) {
    throw new Error("A task can only be related to one entity");
  }
}

/**
 * Validates that the related type matches the provided entity ID
 */
export function validateRelatedTypeMatches(
  relatedType: string | null | undefined,
  sculptureId: string | null | undefined,
  clientId: string | null | undefined, 
  orderId: string | null | undefined, 
  leadId: string | null | undefined
): void {
  if (sculptureId && relatedType !== "sculpture") {
    throw new Error("Related type must be 'sculpture' when sculpture_id is provided");
  }
  
  if (clientId && relatedType !== "client") {
    throw new Error("Related type must be 'client' when client_id is provided");
  }
  
  if (orderId && relatedType !== "order") {
    throw new Error("Related type must be 'order' when order_id is provided");
  }
  
  if (leadId && relatedType !== "lead") {
    throw new Error("Related type must be 'lead' when lead_id is provided");
  }
}

/**
 * Validates that related type is specified when a related entity is set
 */
export function validateRelatedTypeExists(
  relatedType: string | null | undefined,
  entityCount: number
): void {
  if (entityCount === 1 && !relatedType) {
    throw new Error("Related type must be specified when a related entity is set");
  }
}

/**
 * Validates all task-related entity constraints
 */
export function validateTaskEntityRelationships(input: CreateTaskInput | UpdateTaskInput): void {
  // For UpdateTaskInput, we only validate if any of the related fields are being updated
  if ('id' in input &&
      input.sculpture_id === undefined && 
      input.client_id === undefined && 
      input.order_id === undefined && 
      input.lead_id === undefined &&
      input.related_type === undefined) {
    return; // Skip validation for updates that don't change relationships
  }
  
  const sculptureId = input.sculpture_id;
  const clientId = input.client_id;
  const orderId = input.order_id;
  const leadId = input.lead_id;
  
  const entityCount = [
    sculptureId, 
    clientId, 
    orderId, 
    leadId
  ].filter(entity => entity !== undefined && entity !== null).length;
  
  validateSingleRelatedEntity(sculptureId, clientId, orderId, leadId);
  
  if ('id' in input) {
    // For updates, only validate related_type if it's being changed
    if (input.related_type !== undefined) {
      validateRelatedTypeMatches(
        input.related_type, 
        sculptureId, 
        clientId, 
        orderId, 
        leadId
      );
    }
  } else {
    // For creates, always validate related_type
    validateRelatedTypeExists(input.related_type, entityCount);
    
    if (entityCount > 0) {
      validateRelatedTypeMatches(
        input.related_type, 
        sculptureId, 
        clientId, 
        orderId, 
        leadId
      );
    }
  }
}
