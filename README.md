```markdown
# API Load Testing Tool

A comprehensive testing tool to identify performance bottlenecks in your API when multiple users are active simultaneously.

## 📋 What This Tool Does

This tool simulates real users interacting with your API to help you find performance issues. Each simulated user will:

1. ✅ Register an account
2. ✅ Verify their email
3. ✅ Log in
4. ✅ Create 10 job posts
5. ✅ Fetch all posts
6. ✅ Update one of their posts

At the end, you'll get a detailed report showing which operations are slow and where the bottlenecks are.
```

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Run Your First Test

```bash
npm run test:mixed
```

This will simulate 10 users (1 user first, then 9 users at the same time) and show you where your API struggles.

## 📊 Understanding Test Types

### Sequential Test
**What it means:** Tests users one at a time, like a queue at a bank.

```bash
npm run test:sequential
```

- User 1 completes all actions → User 2 starts → User 3 starts → etc.
- **Use this when:** You want to see how fast your API is with no competition
- **Good for:** Establishing a baseline - "How fast is my API when only ONE person is using it?"

**Real-world example:** Like testing your coffee machine by making one cup at a time. If it takes 2 minutes per cup with no line, that's your baseline.

---

### Parallel Test
**What it means:** All users act at the same time, like Black Friday shoppers rushing into a store.

```bash
npm run test:parallel
```

- All 10 users start simultaneously and compete for resources
- **Use this when:** You want to stress test your API under heavy load
- **Good for:** Finding out "What happens when 10 people try to create posts at the exact same time?"

**Real-world example:** Like 10 people trying to use the same coffee machine simultaneously. This is where you'll see if your machine (API) can handle the pressure or if people have to wait.

---

### Mixed Test (Recommended)
**What it means:** One user goes first, then everyone else rushes in together.

```bash
npm run test:mixed
```

- User 1 completes all actions (establishes baseline)
- Then Users 2-10 all act simultaneously
- **Use this when:** You want to compare single-user performance vs multi-user chaos
- **Good for:** Seeing the exact difference between "one user" and "many users"

**Real-world example:** First person makes coffee smoothly (2 minutes), then 9 people rush in. Now each cup takes 15 minutes because they're all competing. This clearly shows your bottleneck.

---

## 🎯 Common Use Cases

### "My API feels slow with multiple users"
```bash
npm run test:mixed
```
This will show you the performance difference between 1 user and many users.

---

### "I want to see if my API can handle 50 simultaneous users"
```bash
npm run test:heavy
```
Stress test with 50 users all acting at once.

---

### "I need to test with a custom number of users"
```bash
# Test with 25 users in parallel
npx ts-node index.ts parallel 25

# Test with 100 users sequentially
npx ts-node index.ts sequential 100

# Test with 5 users (1 first, then 4 in parallel)
npx ts-node index.ts mixed 5
```

---

## 📈 Reading the Results

After the test completes, you'll see a report like this:

```
==========================================
LOAD TEST REPORT
==========================================

createPost:
  Total: 100 | Success: 95 | Failed: 5
  Duration (ms): Avg: 1250.50 | Min: 450.20 | Max: 8500.75 | Median: 980.30

getPosts:
  Total: 10 | Success: 10 | Failed: 0
  Duration (ms): Avg: 320.15 | Min: 250.10 | Max: 450.50 | Median: 310.20

Overall Statistics:
  Total Operations: 130
  Successful: 125 (96.15%)
  Failed: 5 (3.85%)
  Total Test Duration: 45.50s
  Operations per Second: 2.86
```

### What to Look For:

#### ⚠️ Red Flags (Problems):
- **High Max Duration:** If `Max` is 10x higher than `Avg`, some requests are getting stuck
- **High Failure Rate:** If more than 5% of operations fail, there's a serious issue
- **Slow Average Times:** 
  - Creating posts: Should be < 2000ms
  - Getting posts: Should be < 500ms
  - Login/Register: Should be < 1000ms

#### ✅ Good Signs:
- Failure rate < 5%
- Max duration is close to Average duration (means consistent performance)
- Operations per second > 5

---

## 🔍 Finding Your MongoDB Transaction Issue

Since you suspect MongoDB transactions are the problem, compare these two tests:

```bash
# Test 1: One user at a time (transactions work fine)
npm run test:sequential

# Test 2: Many users at once (transactions might lock)
npm run test:parallel
```

**If you see this pattern, you have a transaction locking problem:**

```
Sequential Test Results:
  createPost: Avg: 500ms, Max: 750ms ✅

Parallel Test Results:
  createPost: Avg: 5000ms, Max: 25000ms ❌
```

The huge difference means your transactions are blocking each other. When 10 users try to create posts simultaneously, they have to wait for each other's transactions to complete.

---

## 🛠️ Available Test Commands

| Command | Users | Mode | Best For |
|---------|-------|------|----------|
| `npm run test:sequential` | 10 | One at a time | Baseline performance |
| `npm run test:parallel` | 10 | All at once | Stress testing |
| `npm run test:mixed` | 10 | 1 then 9 parallel | Finding bottlenecks |
| `npm run test:heavy` | 50 | All at once | Heavy load testing |

---

## 📁 Output Files

### Console Output
Real-time progress showing each user's actions:
```
✓ User 1 registered: loadtest_1729900000_abc@maildrop.cc
✓ User 1 verified
✓ User 1 logged in
✓ User 1 created post 1
✓ User 1 created post 2
...
```

### JSON Report
After testing, check `load-test-metrics.json` for detailed data:
```json
[
  {
    "userId": 1,
    "operation": "createPost",
    "duration": 1250.5,
    "success": true,
    "timestamp": 1729900000000
  },
  ...
]
```

Use this file to create graphs or do deeper analysis in Excel/Google Sheets.

---

## 💡 Tips for Better Testing

1. **Start Small:** Test with 5 users first, then scale up
2. **Test at Different Times:** Your API might perform differently during peak hours
3. **Run Multiple Times:** Run each test 3 times and average the results
4. **Watch Your Server:** Monitor CPU and memory usage during tests
5. **Test One Thing at a Time:** If you make changes, test again to measure improvement

---

## 🐛 Troubleshooting

### "I get connection errors"
- Make sure your API is running
- Check if the BASE_URL in the script matches your API
- Verify your internet connection

### "All operations are failing"
- Check your API logs for errors
- Verify the verification code is "123456" or update the script
- Make sure your database is running

### "Tests are too slow"
- This might be the problem you're investigating! 
- Check the report to see which operations are slowest
- Look for MongoDB transaction locks in your server logs

---

## 🎓 Understanding the Results - Real Example

Let's say you run `npm run test:mixed` and get these results:

**Sequential (User 1 alone):**
- createPost: 500ms average
- getPosts: 200ms average

**Parallel (Users 2-10 together):**
- createPost: 4500ms average ← **9x slower!**
- getPosts: 250ms average ← about the same

**What this tells you:**
- **Problem identified:** Creating posts is the bottleneck
- **Likely cause:** MongoDB transactions are locking when multiple users create posts
- **Solution needed:** Optimize your transaction handling or consider alternative approaches

---

## 📞 Questions?

If something doesn't work or you need help understanding the results, check:
1. Is your API URL correct in the script? (Line 5: `const BASE_URL = ...`)
2. Are you getting any error messages in red?
3. Does the `load-test-metrics.json` file have data?

---

## 🔄 Next Steps After Testing

1. **Identify the slowest operation** from the report
2. **Check your server logs** during that operation
3. **Look for MongoDB transaction locks** or long-running queries
4. **Optimize the problematic code**
5. **Test again** to measure improvement

Good luck finding your performance bottleneck! 🚀
```
