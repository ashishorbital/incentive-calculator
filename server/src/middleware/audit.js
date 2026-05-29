import { supabase } from '../config/supabase.js';

export async function logAudit(userId, action, entity, entityId, details = {}) {
  try {
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action,
      entity,
      entity_id: entityId,
      details,
    });
  } catch (e) {
    console.error('Audit log failed:', e.message);
  }
}
