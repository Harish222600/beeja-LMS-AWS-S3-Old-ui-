import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { executeCode, validateCodeWithTestCases } from '../../services/codeExecution';

const CodeEditor = ({ 
  language = 'javascript', 
  starterCode = '', 
  onChange, 
  height = '400px',
  testCases = [],
  showInput = false,
  showOutput = false,
  allowLanguageChange = false
}) => {
  const [code, setCode] = useState(starterCode);
  const [customInput, setCustomInput] = useState('');
  const [output, setOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionStatus, setExecutionStatus] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState(language);

  useEffect(() => {
    setCode(starterCode);
  }, [starterCode]);

  useEffect(() => {
    setCurrentLanguage(language);
  }, [language]);

  const handleEditorChange = (value) => {
    setCode(value || '');
    if (onChange) {
      onChange(value || '');
    }
  };

  const handleLanguageChange = (newLanguage) => {
    setCurrentLanguage(newLanguage);
    if (onChange) {
      onChange(code);
    }
  };

  const runCode = async () => {
    if (!code.trim()) {
      setOutput('No code to execute');
      return;
    }

    setIsExecuting(true);
    setOutput('Executing...');
    setExecutionStatus(null);

    try {
      // Run the code first to get output
      const codeResult = await executeCode(code, currentLanguage, customInput);
      
      if (codeResult.success) {
        // Set the code output
        setOutput(codeResult.data.stdout || 'No output');
        
        // If there are test cases, run them in parallel but don't show in output
        if (testCases && testCases.length > 0) {
          try {
            const testResult = await validateCodeWithTestCases(code, currentLanguage, testCases);
            setExecutionStatus({
              success: codeResult.data.stderr || codeResult.data.compile_output ? false : true,
              error: codeResult.data.stderr || codeResult.data.compile_output || null,
              status: codeResult.data.status,
              time: codeResult.data.time,
              memory: codeResult.data.memory,
              testsRun: testResult.totalCount,
              testsPassed: testResult.passedCount,
              testResults: testResult.results
            });
          } catch (testError) {
            // If test execution fails, still show code output but no test results
            setExecutionStatus({
              success: codeResult.data.stderr || codeResult.data.compile_output ? false : true,
              error: codeResult.data.stderr || codeResult.data.compile_output || null,
              status: codeResult.data.status,
              time: codeResult.data.time,
              memory: codeResult.data.memory
            });
          }
        } else {
          // No test cases, just show code execution status
          setExecutionStatus({
            success: codeResult.data.stderr || codeResult.data.compile_output ? false : true,
            error: codeResult.data.stderr || codeResult.data.compile_output || null,
            status: codeResult.data.status,
            time: codeResult.data.time,
            memory: codeResult.data.memory
          });
        }
      } else {
        setOutput(''); // Clear output on error
        setExecutionStatus({
          success: false,
          error: codeResult.error || 'Unknown error'
        });
      }
    } catch (error) {
      setOutput(''); // Clear output on error
      setExecutionStatus({
        success: false,
        error: error.message
      });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="bg-richblack-800 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-white">Code Editor</h3>
          {allowLanguageChange && (
            <select
              value={currentLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-richblack-700 text-white px-3 py-1 rounded border border-richblack-600"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="c">C</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
              <option value="ruby">Ruby</option>
              <option value="csharp">C#</option>
              <option value="kotlin">Kotlin</option>
              <option value="typescript">TypeScript</option>
              <option value="sql">SQL</option>
            </select>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={runCode}
            disabled={isExecuting}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white px-4 py-2 rounded transition-colors flex items-center gap-2"
          >
            {isExecuting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Running...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Run Code
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="border border-richblack-600 rounded-lg overflow-hidden">
        <Editor
          height={height}
          language={currentLanguage}
          value={code}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on'
          }}
        />
      </div>

      {/* Input Section */}
      {showInput && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-richblack-300 mb-2">
            Custom Input
          </label>
          <textarea
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Enter input for your program..."
            className="w-full bg-richblack-700 text-white p-3 rounded border border-richblack-600 focus:border-yellow-50 focus:outline-none resize-vertical"
            rows={3}
          />
        </div>
      )}

      {/* Output Section */}
      {(showOutput || output || executionStatus) && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-richblack-300">
              Output
            </label>
            {executionStatus && (
              <div className="flex items-center gap-2 text-sm">
                {executionStatus.success ? (
                  <span className="text-green-400">✅ Success</span>
                ) : (
                  <span className="text-red-400">❌ Error</span>
                )}
                {executionStatus.time && (
                  <span className="text-richblack-300">
                    Time: {executionStatus.time}s
                  </span>
                )}
                {executionStatus.memory && (
                  <span className="text-richblack-300">
                    Memory: {executionStatus.memory}KB
                  </span>
                )}
              </div>
            )}
          </div>
          
          {/* Program Output */}
          <div className="bg-richblack-900 text-richblack-25 p-3 rounded border border-richblack-600 font-mono text-sm whitespace-pre-wrap max-h-60 overflow-y-auto">
            {output || 'No output yet. Run your code to see results.'}
          </div>
          
          {/* Error Display */}
          {executionStatus?.error && (
            <div className="mt-2">
              <label className="block text-sm font-medium text-red-400 mb-1">
                Error
              </label>
              <div className="bg-red-900/20 border border-red-600 text-red-200 p-3 rounded font-mono text-sm whitespace-pre-wrap max-h-40 overflow-y-auto">
                {executionStatus.error}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Test Cases Section */}
      {testCases && testCases.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-richblack-5">Test Cases</h3>
            {executionStatus?.testResults && (
              <div className="flex items-center gap-2 text-sm">
                <span className={`font-medium ${
                  executionStatus.testResults.filter(r => r.passed).length === testCases.length
                    ? 'text-green-400' 
                    : 'text-yellow-400'
                }`}>
                  {executionStatus.testResults.filter(r => r.passed).length}/{testCases.length} Passed
                </span>
              </div>
            )}
          </div>
          <div className="space-y-4">
            {testCases.filter(tc => !tc.isHidden).map((testCase, visibleIndex) => {
              // Find the actual index in the original testCases array
              const actualIndex = testCases.findIndex(tc => tc === testCase);
              return (
                <div key={actualIndex} className="bg-richblack-700 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium text-richblack-50">Test Case {visibleIndex + 1}</h4>
                    {executionStatus?.testResults && (
                      <span className={`text-sm font-medium ${
                        executionStatus.testResults[actualIndex]?.passed 
                          ? 'text-green-400' 
                          : 'text-red-400'
                      }`}>
                        {executionStatus.testResults[actualIndex]?.passed ? '✅ Passed' : '❌ Failed'}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-richblack-300 mb-1">Input</label>
                      <div className="bg-richblack-800 p-3 rounded font-mono text-sm text-richblack-100 min-h-[60px] whitespace-pre-wrap">
                        {testCase.input || '(empty)'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-richblack-300 mb-1">Expected Output</label>
                      <div className="bg-richblack-800 p-3 rounded font-mono text-sm text-richblack-100 whitespace-pre-wrap min-h-[60px]">
                        {testCase.expectedOutput}
                      </div>
                    </div>
                  </div>
                  {executionStatus?.testResults && executionStatus.testResults[actualIndex] && (
                    <div className="mt-4">
                      <label className="block text-xs text-richblack-300 mb-1">Your Output</label>
                      <div className="bg-richblack-800 p-3 rounded font-mono text-sm text-richblack-100 whitespace-pre-wrap min-h-[60px]">
                        {executionStatus.testResults[actualIndex].actualOutput || '(no output)'}
                      </div>
                      {executionStatus.testResults[actualIndex].error && (
                        <div className="mt-2 text-xs text-red-400">
                          Error: {executionStatus.testResults[actualIndex].error}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
