// Real code execution service using Piston API

// Rate limiting setup
const rateLimiter = {
  tokens: 5,
  lastRefill: Date.now(),
  refillRate: 2000, // 1 token per 2 seconds
  maxTokens: 5
};

// Helper to check rate limit
const checkRateLimit = () => {
  const now = Date.now();
  const timePassed = now - rateLimiter.lastRefill;
  const tokensToAdd = Math.floor(timePassed / rateLimiter.refillRate);
  
  if (tokensToAdd > 0) {
    rateLimiter.tokens = Math.min(rateLimiter.maxTokens, rateLimiter.tokens + tokensToAdd);
    rateLimiter.lastRefill = now;
  }

  if (rateLimiter.tokens <= 0) {
    throw new Error("Rate limit exceeded. Please wait a moment before trying again.");
  }

  rateLimiter.tokens--;
};

// Transform JavaScript code to work in Node.js environment
const transformJavaScriptCode = (code, customInput) => {
  if (!code.includes('prompt(')) {
    return code;
  }

  // Convert input to array of lines
  const inputLines = customInput.split('\n').filter(line => line.trim());
  
  // Add input handling at the beginning
  const inputSetup = `
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Mock prompt function using stdin
const inputLines = ${JSON.stringify(inputLines)};
let inputIndex = 0;

function prompt(message) {
  // Don't display the prompt message in output
  return inputLines[inputIndex++] || '';
}

// Mock alert function
function alert(message) {
  console.log(message);
}

`;

  // Wrap the user code in an async function if it contains prompt
  const wrappedCode = `
${inputSetup}

// User code starts here
${code}

rl.close();
`;

  return wrappedCode;
};


// Execute code using Piston API
export const executeCode = async (code, language, customInput = "") => {
  try {
    // Check rate limit before executing
    checkRateLimit();
    
    const pistonLanguageMap = {
      javascript: "javascript",
      python: "python",
      java: "java",
      cpp: "cpp",
      c: "c",
      go: "go",
      rust: "rust",
      ruby: "ruby",
      csharp: "csharp",
      kotlin: "kotlin",
      typescript: "typescript",
      sql: "sqlite"
    };

    const pistonLanguage = pistonLanguageMap[language];
    if (!pistonLanguage) {
      return {
        success: false,
        error: `Language ${language} not supported`
      };
    }

    // Transform code based on language
    let processedCode = code;
    let processedInput = customInput;

    if (language === 'javascript') {
      processedCode = transformJavaScriptCode(code, customInput);
      processedInput = ''; // Input is now handled within the code
    } else if (language === 'kotlin') {
      // Check if code needs Scanner (contains readLine, nextInt, etc.)
      const needsScanner = code.includes('readLine') || code.includes('nextInt') || code.includes('nextDouble') || code.includes('next()') || code.includes('scanner.');
      
      // Ensure Kotlin code has proper main function structure
      if (!code.includes('fun main')) {
        if (needsScanner && customInput && customInput.trim()) {
          processedCode = `
import java.util.*

fun main() {
    val scanner = Scanner(System.\`in\`)
${code.split('\n').map(line => '    ' + line).join('\n')}
}`;
        } else {
          processedCode = `
fun main() {
${code.split('\n').map(line => '    ' + line).join('\n')}
}`;
        }
      } else if (needsScanner && customInput && customInput.trim() && !code.includes('Scanner')) {
        // Add Scanner import if needed but main function exists
        processedCode = `import java.util.*

${code}`;
      }
    }
    // For other languages, we'll use the normal stdin approach

    // Determine the correct filename and extension
    let fileName = 'main';
    if (language === 'java') {
      fileName = 'Main.java';
    } else if (language === 'cpp') {
      fileName = 'main.cpp';
    } else if (language === 'c') {
      fileName = 'main.c';
    } else if (language === 'go') {
      fileName = 'main.go';
    } else if (language === 'rust') {
      fileName = 'main.rs';
    } else if (language === 'ruby') {
      fileName = 'main.rb';
    } else if (language === 'python') {
      fileName = 'main.py';
    } else if (language === 'javascript') {
      fileName = 'main.js';
    } else if (language === 'typescript') {
      fileName = 'main.ts';
    } else if (language === 'csharp') {
      fileName = 'main.cs';
    } else if (language === 'kotlin') {
      fileName = 'main.kt';
    } else if (language === 'sql') {
      fileName = 'main.sql';
      // Add SQLite setup commands
      processedCode = `
-- Enable column headers in output
.headers on
.mode column

-- Create temporary in-memory database
.open :memory:

-- Execute user's SQL code
${code}`;
    }

    const pistonData = {
      language: pistonLanguage,
      version: "*",
      files: [
        {
          name: fileName,
          content: processedCode
        }
      ],
      stdin: processedInput,
      // Add compilation and runtime args - increase timeouts for Kotlin
      compile_timeout: language === 'kotlin' ? 30000 : 10000,
      run_timeout: language === 'kotlin' ? 15000 : 10000,
      compile_memory_limit: -1,
      run_memory_limit: -1
    };

    const response = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pistonData)
    });

    if (!response.ok) {
      throw new Error(`Execution API error: ${response.status}`);
    }

    const result = await response.json();

    // Get clean output
    let stdout = result.run.stdout || "";
    
    // Clean input prompts from output for all languages
    if (language !== 'javascript') {
      // Remove common input prompt patterns
      const inputPromptPatterns = [
        /Enter\s+.*?:\s*/gi,
        /Input\s+.*?:\s*/gi,
        /Please\s+enter\s+.*?:\s*/gi,
        /Enter\s+first\s+.*?:\s*/gi,
        /Enter\s+second\s+.*?:\s*/gi,
        /Enter\s+the\s+.*?:\s*/gi,
        /Enter\s+a\s+string:\s*/gi,
        /Enter\s+a\s+number:\s*/gi,
        /Enter\s+value:\s*/gi,
        /Enter\s+.*?number.*?:\s*/gi,
        /Enter\s+.*?name.*?:\s*/gi,
        /Enter\s+.*?text.*?:\s*/gi,
        /Type\s+.*?:\s*/gi,
        /Provide\s+.*?:\s*/gi,
        /Give\s+.*?:\s*/gi
      ];
      
      for (const pattern of inputPromptPatterns) {
        stdout = stdout.replace(pattern, '');
      }
    }
    
    // Clean up extra newlines and whitespace
    stdout = stdout.replace(/\n\s*\n/g, '\n').trim();

    return {
      success: true,
      data: {
        stdout,
        stderr: result.run.stderr || "",
        compile_output: result.compile?.stderr || "",
        status: { 
          id: result.run.code === 0 ? 3 : 6, 
          description: result.run.code === 0 ? "Accepted" : "Runtime Error" 
        },
        time: result.run.time || "0.01",
        memory: result.run.memory || 1024
      }
    };
  } catch (error) {
    console.error("Code execution error:", error);
    return {
      success: false,
      error: error.message.includes("Rate limit exceeded") 
        ? "Too many requests. Please wait a few seconds before trying again."
        : error.message
    };
  }
};

// Helper function to add delay between requests
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Validate code with test cases using real execution
export const validateCodeWithTestCases = async (code, language, testCases) => {
  // Execute test cases with a small delay between each to avoid rate limiting
  const testPromises = testCases.map((testCase, index) => 
    delay(index * 200).then(() => executeCode(code, language, testCase.input)
      .then(result => {
        if (result.success) {
          const cleanOutput = (output) => output.trim().replace(/\r\n/g, '\n');
          const expectedOutput = cleanOutput(testCase.expectedOutput);
          const actualOutput = cleanOutput(result.data.stdout || '');
          
          const passed = expectedOutput === actualOutput;
          
          return {
            passed,
            input: testCase.input,
            expectedOutput,
            actualOutput,
            error: result.data.stderr || null
          };
        } else {
          return {
            passed: false,
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            actualOutput: "",
            error: result.error || "Execution failed"
          };
        }
      })
      .catch(error => ({
        passed: false,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: "",
        error: error.message
      })))
  );

  // Wait for all test cases to complete
  const results = await Promise.all(testPromises);
  const passedCount = results.filter(r => r.passed).length;

  return {
    results,
    passedCount,
    totalCount: testCases.length,
    allPassed: passedCount === testCases.length
  };
};
