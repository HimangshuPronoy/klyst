import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const listId = formData.get('list_id');
    const userId = formData.get('user_id');

    if (!file || !listId || !userId) {
      return Response.json({ error: 'Missing file, list_id, or user_id' }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split('\n').filter(l => l.trim());

    if (lines.length < 2) {
      return Response.json({ error: 'CSV must have at least a header row and one data row' }, { status: 400 });
    }

    // Parse header
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));

    // Find column mappings
    const emailIdx = headers.findIndex(h => h.includes('email'));
    const nameIdx = headers.findIndex(h => h === 'name' || h === 'full_name' || h === 'full name');
    const firstNameIdx = headers.findIndex(h => h === 'first_name' || h === 'first name' || h === 'firstname');
    const lastNameIdx = headers.findIndex(h => h === 'last_name' || h === 'last name' || h === 'lastname');
    const companyIdx = headers.findIndex(h => h.includes('company') || h.includes('organization'));
    const titleIdx = headers.findIndex(h => h.includes('title') || h.includes('position') || h.includes('role'));
    const phoneIdx = headers.findIndex(h => h.includes('phone'));

    if (emailIdx === -1) {
      return Response.json({ error: 'CSV must have an "email" column' }, { status: 400 });
    }

    // Parse rows
    const leads = [];
    const errors = [];

    for (let i = 1; i < lines.length; i++) {
      try {
        const cols = parseCSVLine(lines[i]);
        const email = (cols[emailIdx] || '').trim();

        if (!email || !email.includes('@')) {
          errors.push({ row: i + 1, reason: 'Invalid or missing email' });
          continue;
        }

        let name = '';
        if (nameIdx >= 0) {
          name = (cols[nameIdx] || '').trim();
        } else if (firstNameIdx >= 0) {
          name = [(cols[firstNameIdx] || '').trim(), (cols[lastNameIdx] || '').trim()].filter(Boolean).join(' ');
        }

        leads.push({
          list_id: listId,
          user_id: userId,
          email,
          name: name || email.split('@')[0],
          company: companyIdx >= 0 ? (cols[companyIdx] || '').trim() : '',
          title: titleIdx >= 0 ? (cols[titleIdx] || '').trim() : '',
          status: 'unverified',
        });
      } catch {
        errors.push({ row: i + 1, reason: 'Failed to parse row' });
      }
    }

    if (leads.length === 0) {
      return Response.json({ error: 'No valid leads found in the CSV' }, { status: 400 });
    }

    // Insert in batches of 500
    let imported = 0;
    for (let i = 0; i < leads.length; i += 500) {
      const batch = leads.slice(i, i + 500);
      const { error } = await supabase.from('leads').insert(batch);
      if (!error) imported += batch.length;
    }

    return Response.json({
      success: true,
      imported,
      skipped: errors.length,
      total: lines.length - 1,
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
    });
  } catch (error) {
    return Response.json({ error: `Import failed: ${error.message}` }, { status: 500 });
  }
}

// Parse a CSV line handling quoted fields
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}
