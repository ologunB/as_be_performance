import axios, { AxiosInstance } from "axios";
import FormData from "form-data";
import { performance } from "perf_hooks";
import * as fs from "fs";

const BASE_URL = "https://africa-skillz-api-wktm5.ondigitalocean.app/api/v1";

interface UserCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationName: string;
  role: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface TestMetrics {
  userId: number;
  operation: string;
  duration: number;
  success: boolean;
  timestamp: number;
  error?: string;
}

class APILoadTester {
  private metrics: TestMetrics[] = [];
  private userCount: number;

  constructor(userCount: number = 10) {
    this.userCount = userCount;
  }

  private generateRandomEmail(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    return `loadtest_${timestamp}_${random}@maildrop.cc`;
  }

  private generateRandomName(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    return `company_${timestamp}_${random}`;
  }

  private async recordMetric(
    userId: number,
    operation: string,
    startTime: number,
    success: boolean,
    error?: string
  ) {
    this.metrics.push({
      userId,
      operation,
      duration: performance.now() - startTime,
      success,
      timestamp: Date.now(),
      error,
    });
  }

  private async createUser(userId: number): Promise<UserCredentials | null> {
    const startTime = performance.now();
    const email = this.generateRandomEmail();
    const credentials: UserCredentials = {
      firstName: `LoadTest`,
      lastName: `User${userId}`,
      organizationName: this.generateRandomName(),
      email,
      password: "Topetope@17",
      role: "recruiter",
    };

    try {
      const response = await axios.post(
        `${BASE_URL}/auth/register`,
        credentials
      );
      await this.recordMetric(userId, "register", startTime, true);
      console.log(`✓ User ${userId} registered: ${email}`);
      return credentials;
    } catch (error: any) {
      await this.recordMetric(
        userId,
        "register",
        startTime,
        false,
        error.message
      );
      console.error(
        `✗ User ${userId} registration failed:`,
        error.response?.data || error.message
      );
      return null;
    }
  }

  private async verifyUser(
    userId: number,
    credentials: UserCredentials
  ): Promise<boolean> {
    const startTime = performance.now();
    try {
      // Using default verification code as per your example
      const response = await axios.post(`${BASE_URL}/auth/verify`, {
        email: credentials.email,
        verifyCode: "123456",
      });
      await this.recordMetric(userId, "verify", startTime, true);
      console.log(`✓ User ${userId} verified`);
      return true;
    } catch (error: any) {
      await this.recordMetric(
        userId,
        "verify",
        startTime,
        false,
        error.message
      );
      console.error(
        `✗ User ${userId} verification failed:`,
        error.response?.data || error.message
      );
      return false;
    }
  }

  private async loginUser(
    userId: number,
    credentials: UserCredentials
  ): Promise<AuthTokens | null> {
    const startTime = performance.now();
    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        email: credentials.email,
        password: credentials.password,
      });
      const tokens = response.data.data.tokens;
      await this.recordMetric(userId, "login", startTime, true);
      console.log(`✓ User ${userId} logged in`);
      return tokens;
    } catch (error: any) {
      await this.recordMetric(userId, "login", startTime, false, error.message);
      console.error(
        `✗ User ${userId} login failed:`,
        error.response?.data || error.message
      );
      return null;
    }
  }

  private async createPost(
    userId: number,
    accessToken: string,
    postNumber: number
  ): Promise<string | null> {
    const startTime = performance.now();
    try {
      const formData = new FormData();
      formData.append("title", `Load Test Post ${userId}-${postNumber}`);
      formData.append("category", "technology");
      formData.append("status", "active");
      formData.append("startDate", new Date().toISOString());
      formData.append(
        "endDate",
        new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString()
      );
      formData.append("location", "Test Location, Nigeria");
      formData.append("companyName", `TestCompany${userId}`);
      formData.append("timeZone", "Africa/Lagos");
      formData.append("subCategory", "remote");
      formData.append("mode", "full_time");
      formData.append(
        "description",
        `Test job description for load testing user ${userId} post ${postNumber}`
      );
      formData.append("details[receiveApplications]", "true");
      formData.append("details[minAmount]", "5000");
      formData.append("details[maxAmount]", "10000");
      formData.append("details[contactDetails]", `hr@testcompany${userId}.com`);
      formData.append("details[contactWebsite]", "https://techcorp.com");

      const response = await axios.post(`${BASE_URL}/job`, formData, {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${accessToken}`,
        },
      });

      await this.recordMetric(userId, "createPost", startTime, true);
      console.log(`✓ User ${userId} created post ${postNumber}`);
      return response.data.data?.id || null;
    } catch (error: any) {
      await this.recordMetric(
        userId,
        "createPost",
        startTime,
        false,
        error.message
      );
      console.error(
        `✗ User ${userId} post ${postNumber} creation failed:`,
        error.response?.data || error.message
      );
      return null;
    }
  }

  private async getPosts(
    userId: number,
    accessToken: string
  ): Promise<boolean> {
    const startTime = performance.now();
    try {
      const response = await axios.get(
        `${BASE_URL}/job?page=1&limit=10&userType=admin`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      await this.recordMetric(userId, "getPosts", startTime, true);
      console.log(`✓ User ${userId} fetched posts`);
      return true;
    } catch (error: any) {
      await this.recordMetric(
        userId,
        "getPosts",
        startTime,
        false,
        error.message
      );
      console.error(
        `✗ User ${userId} get posts failed:`,
        error.response?.data || error.message
      );
      return false;
    }
  }

  private async updatePost(
    userId: number,
    accessToken: string,
    postId: string
  ): Promise<boolean> {
    const startTime = performance.now();
    try {
      const formData = new FormData();
      formData.append("status", "draft");

      const response = await axios.put(`${BASE_URL}/job/${postId}`, formData, {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${accessToken}`,
        },
      });
      await this.recordMetric(userId, "updatePost", startTime, true);
      console.log(`✓ User ${userId} updated post ${postId}`);
      return true;
    } catch (error: any) {
      await this.recordMetric(
        userId,
        "updatePost",
        startTime,
        false,
        error.message
      );
      console.error(
        `✗ User ${userId} update post failed:`,
        error.response?.data || error.message
      );
      return false;
    }
  }

  private async runUserWorkflow(userId: number): Promise<void> {
    console.log(`\n=== Starting workflow for User ${userId} ===`);

    // Step 1: Register user
    const credentials = await this.createUser(userId);
    if (!credentials) return;

    // Step 2: Verify user
    const verified = await this.verifyUser(userId, credentials);
    if (!verified) return;

    // Step 3: Login user
    const tokens = await this.loginUser(userId, credentials);
    if (!tokens) return;

    // Step 4: Create 10 posts
    const postIds: string[] = [];
    for (let i = 1; i <= 10; i++) {
      const postId = await this.createPost(userId, tokens.accessToken, i);
      if (postId) postIds.push(postId);

      // Small delay between post creations to simulate real usage
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Step 5: Get posts
    await this.getPosts(userId, tokens.accessToken);

    // Step 6: Update a random post
    if (postIds.length > 0) {
      const randomPostId = postIds[Math.floor(Math.random() * postIds.length)];
      await this.updatePost(userId, tokens.accessToken, randomPostId);
    }

    console.log(`=== Completed workflow for User ${userId} ===\n`);
  }

  private generateReport(): void {
    console.log("\n\n==========================================");
    console.log("LOAD TEST REPORT");
    console.log("==========================================\n");

    const operations = [...new Set(this.metrics.map((m) => m.operation))];

    operations.forEach((operation) => {
      const opMetrics = this.metrics.filter((m) => m.operation === operation);
      const successful = opMetrics.filter((m) => m.success).length;
      const failed = opMetrics.filter((m) => !m.success).length;
      const durations = opMetrics
        .filter((m) => m.success)
        .map((m) => m.duration);

      if (durations.length === 0) {
        console.log(`${operation}:`);
        console.log(
          `  Total: ${opMetrics.length} | Success: ${successful} | Failed: ${failed}`
        );
        console.log(`  No successful operations to measure duration\n`);
        return;
      }

      const avgDuration =
        durations.reduce((a, b) => a + b, 0) / durations.length;
      const minDuration = Math.min(...durations);
      const maxDuration = Math.max(...durations);
      const medianDuration = durations.sort((a, b) => a - b)[
        Math.floor(durations.length / 2)
      ];

      console.log(`${operation}:`);
      console.log(
        `  Total: ${opMetrics.length} | Success: ${successful} | Failed: ${failed}`
      );
      console.log(
        `  Duration (ms): Avg: ${avgDuration.toFixed(
          2
        )} | Min: ${minDuration.toFixed(2)} | Max: ${maxDuration.toFixed(
          2
        )} | Median: ${medianDuration.toFixed(2)}`
      );

      if (failed > 0) {
        const errors = opMetrics.filter((m) => !m.success).map((m) => m.error);
        const uniqueErrors = [...new Set(errors)];
        console.log(`  Errors: ${uniqueErrors.join(", ")}`);
      }
      console.log("");
    });

    // Overall statistics
    const totalDuration =
      this.metrics[this.metrics.length - 1]?.timestamp -
      this.metrics[0]?.timestamp;
    const totalSuccess = this.metrics.filter((m) => m.success).length;
    const totalFailed = this.metrics.filter((m) => !m.success).length;

    console.log("Overall Statistics:");
    console.log(`  Total Operations: ${this.metrics.length}`);
    console.log(
      `  Successful: ${totalSuccess} (${(
        (totalSuccess / this.metrics.length) *
        100
      ).toFixed(2)}%)`
    );
    console.log(
      `  Failed: ${totalFailed} (${(
        (totalFailed / this.metrics.length) *
        100
      ).toFixed(2)}%)`
    );
    console.log(`  Total Test Duration: ${(totalDuration / 1000).toFixed(2)}s`);
    console.log(
      `  Operations per Second: ${(
        this.metrics.length /
        (totalDuration / 1000)
      ).toFixed(2)}`
    );
    console.log("\n==========================================\n");

    // Save detailed metrics to file
    fs.writeFileSync(
      "load-test-metrics.json",
      JSON.stringify(this.metrics, null, 2)
    );
    console.log("Detailed metrics saved to load-test-metrics.json");
  }

  async runSequentialTest(): Promise<void> {
    console.log("Starting SEQUENTIAL load test...\n");
    const startTime = performance.now();

    for (let i = 1; i <= this.userCount; i++) {
      await this.runUserWorkflow(i);
    }

    const duration = performance.now() - startTime;
    console.log(
      `\nSequential test completed in ${(duration / 1000).toFixed(2)}s`
    );
    this.generateReport();
  }

  async runParallelTest(): Promise<void> {
    console.log("Starting PARALLEL load test...\n");
    const startTime = performance.now();

    const promises = [];
    for (let i = 1; i <= this.userCount; i++) {
      promises.push(this.runUserWorkflow(i));
    }

    await Promise.all(promises);

    const duration = performance.now() - startTime;
    console.log(
      `\nParallel test completed in ${(duration / 1000).toFixed(2)}s`
    );
    this.generateReport();
  }

  async runMixedTest(): Promise<void> {
    console.log(
      "Starting MIXED load test (1 sequential, then 9 parallel)...\n"
    );
    const startTime = performance.now();

    // Run first user sequentially
    await this.runUserWorkflow(1);

    // Run remaining users in parallel
    const promises = [];
    for (let i = 2; i <= this.userCount; i++) {
      promises.push(this.runUserWorkflow(i));
    }

    await Promise.all(promises);

    const duration = performance.now() - startTime;
    console.log(`\nMixed test completed in ${(duration / 1000).toFixed(2)}s`);
    this.generateReport();
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const testType = args[0] || "mixed"; // sequential, parallel, or mixed
  const userCount = parseInt(args[1]) || 10;

  const tester = new APILoadTester(userCount);

  console.log(`Running ${testType} test with ${userCount} users...\n`);

  switch (testType) {
    case "sequential":
      await tester.runSequentialTest();
      break;
    case "parallel":
      await tester.runParallelTest();
      break;
    case "mixed":
    default:
      await tester.runMixedTest();
      break;
  }
}

main().catch(console.error);
