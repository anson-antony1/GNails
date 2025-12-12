# Testing the Full Issue Auto-Creation Flow

## Overview
When customers submit feedback with a rating ≤ 8, the system automatically:
1. Calls the Cloudflare Worker's `/issue-classify` endpoint
2. Creates an Issue in the database if AI confirms it's a problem
3. Displays it in the Issue Inbox with AI categorization

## Test Steps

### Step 1: Start Services

```bash
# Terminal 1: Start Prisma dev server (if not running)
cd /Users/anson/Developer/GNails/g-nail-growth
npx prisma dev

# Terminal 2: Start Next.js dev server
cd /Users/anson/Developer/GNails/g-nail-growth
npm run dev
```

### Step 2: Create a Test Visit

1. Go to http://localhost:3000/check-in
2. Enter a phone number: `555-TEST-01`
3. Enter customer name: `Test Customer`
4. Select a service: `Gel Manicure`
5. Click "Complete Check-In"
6. **Note the Feedback Request ID** from the success message or check terminal logs

### Step 3: Submit Low-Rated Feedback

Visit the feedback page: `http://localhost:3000/feedback/{FEEDBACK_REQUEST_ID}`

**Test Case 1: Wait Time Issue (Should Create Issue)**
- Rating: 5
- Comment: "The wait time was over an hour and no one told me why. Very frustrating experience."
- Click Submit

**Test Case 2: Service Quality Issue (Should Create Issue)**
- Create another visit first, then:
- Rating: 6
- Comment: "My technician seemed very rushed and the polish started chipping the next day. Not happy with the quality."
- Click Submit

**Test Case 3: Minor Issue (Should Create Issue - Low Severity)**
- Create another visit first, then:
- Rating: 7
- Comment: "Service was okay but I think the prices are a bit high for what you get."
- Click Submit

**Test Case 4: Positive Feedback (Should NOT Create Issue)**
- Create another visit first, then:
- Rating: 9
- Comment: "Great service, loved my nails!"
- Click Submit

### Step 4: Check the Issue Inbox

Go to http://localhost:3000/issues

You should see:
- ✅ **3 issues** created from the low ratings (ratings 5, 6, 7)
- ✅ Each issue categorized by AI:
  - First one: Category "wait time", Severity "medium" or "high"
  - Second one: Category "service quality", Severity "medium"
  - Third one: Category "pricing", Severity "low"
- ✅ AI-generated summaries visible
- ❌ **No issue** from the rating of 9

### Step 5: Verify in Terminal

Check your Next.js dev server terminal. You should see logs like:

```
Created issue for feedback {id}: wait time (medium)
Created issue for feedback {id}: service quality (medium)
Created issue for feedback {id}: pricing (low)
Rating 9 but not classified as issue: Great service, loved my nails!...
```

### Step 6: Test Issue Management

In the Issue Inbox (http://localhost:3000/issues):

1. Click "View Details" on any issue
   - Should show full customer comment
   - Shows customer contact info
   
2. Click "Start Working" on an issue
   - Status changes from "open" to "in_progress"
   
3. Click "Mark Resolved"
   - Issue disappears from the inbox (only shows open/in_progress)

4. Use severity filters
   - Click "High", "Medium", "Low" to filter
   - Click "All" to see everything

## Expected Database State

After all tests, run:

```bash
cd /Users/anson/Developer/GNails/g-nail-growth
npx prisma studio
```

Browse to the `issues` table. You should see:
- 3 issues created
- Each with:
  - `status`: "open" (or "in_progress"/"resolved" if you tested those)
  - `severity`: "low", "medium", or "high"
  - `category`: "wait time", "service quality", "pricing", etc.
  - `summary`: AI-generated text
  - `details`: Original customer comment
  - `ownerResponse`: NULL (because /issue-classify doesn't generate responses)

## Troubleshooting

**If issues aren't being created:**

1. Check terminal logs for errors
2. Verify the Worker URL is correct in `.env`:
   ```
   CLOUDFLARE_AI_WORKER_URL="https://gnail-ai-worker.ansonkanniman.workers.dev"
   ```
3. Test the Worker directly:
   ```bash
   curl -X POST https://gnail-ai-worker.ansonkanniman.workers.dev/issue-classify \
     -H "Content-Type: application/json" \
     -d '{"rating": 5, "comment": "Wait time too long"}'
   ```
   Should return: `{"isIssue":true,"severity":"...","category":"...","summary":"..."}`

**If the Issue Inbox is empty:**

1. Make sure you're submitting ratings ≤ 8 (not 9 or 10)
2. Make sure you're including a comment (not empty)
3. Check the database: `npx prisma studio` → Browse `issues` table

## Success Criteria

✅ Low ratings (≤8) with comments automatically create Issues  
✅ High ratings (≥9) do NOT create Issues  
✅ Issues are AI-categorized with severity, category, and summary  
✅ Issue Inbox displays all open/in-progress issues  
✅ Can filter issues by severity  
✅ Can update issue status (open → in_progress → resolved)  
✅ Feedback submission never fails even if issue creation fails  

## Next Steps

Once this is working, you can:
- Add the `/categorize-issue` endpoint call to get AI-drafted owner responses
- Add SMS/email notifications when high-severity issues are created
- Create a "Today at the Salon" view showing recent visits and pending issues
- Add issue assignment to specific staff members
