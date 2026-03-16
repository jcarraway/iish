use std::process::Stdio;
use tokio::process::Command;
use tracing::{info, warn};

use crate::error::PipelineError;

/// Output from a subprocess execution.
#[derive(Debug)]
pub struct ProcessOutput {
    pub exit_code: i32,
    pub stdout: String,
    pub stderr: String,
}

/// Run a command and capture its output.
pub async fn run_command(program: &str, args: &[&str]) -> Result<ProcessOutput, PipelineError> {
    info!(program, ?args, "running command");

    let output = Command::new(program)
        .args(args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| PipelineError::Other(format!("failed to spawn {program}: {e}")))?
        .wait_with_output()
        .await
        .map_err(|e| PipelineError::Other(format!("failed to wait for {program}: {e}")))?;

    let exit_code = output.status.code().unwrap_or(-1);
    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();

    // Detect OOM kill (signal 9 on Linux)
    #[cfg(unix)]
    {
        use std::os::unix::process::ExitStatusExt;
        if output.status.signal() == Some(9) {
            warn!(program, "process killed by signal 9 (OOM)");
            return Err(PipelineError::OutOfMemory);
        }
    }

    if !output.status.success() {
        warn!(program, exit_code, stderr = %stderr.trim(), "command failed");
    }

    Ok(ProcessOutput {
        exit_code,
        stdout,
        stderr,
    })
}

/// Run a piped command: `program1 args1 | program2 args2`.
/// Used for `bwa-mem2 | samtools sort`.
pub async fn run_piped(
    program1: &str,
    args1: &[&str],
    program2: &str,
    args2: &[&str],
) -> Result<ProcessOutput, PipelineError> {
    info!(program1, program2, "running piped command");

    let mut child1 = Command::new(program1)
        .args(args1)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| PipelineError::Other(format!("failed to spawn {program1}: {e}")))?;

    let child1_stdout = child1
        .stdout
        .take()
        .ok_or_else(|| PipelineError::Other("no stdout from first process".to_string()))?;

    let child1_stdio: Stdio = child1_stdout.try_into()
        .map_err(|e| PipelineError::Other(format!("failed to convert stdout to stdio: {e}")))?;

    let child2 = Command::new(program2)
        .args(args2)
        .stdin(child1_stdio)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| PipelineError::Other(format!("failed to spawn {program2}: {e}")))?;

    // Wait for both processes
    let status1 = child1
        .wait()
        .await
        .map_err(|e| PipelineError::Other(format!("failed to wait for {program1}: {e}")))?;

    let output2 = child2
        .wait_with_output()
        .await
        .map_err(|e| PipelineError::Other(format!("failed to wait for {program2}: {e}")))?;

    // Check for OOM on either process
    #[cfg(unix)]
    {
        use std::os::unix::process::ExitStatusExt;
        if status1.signal() == Some(9) || output2.status.signal() == Some(9) {
            return Err(PipelineError::OutOfMemory);
        }
    }

    if !status1.success() {
        let stderr1 = child1
            .stderr
            .take()
            .map(|_| String::new())
            .unwrap_or_default();
        return Err(PipelineError::ToolCrash {
            code: status1.code().unwrap_or(-1),
            message: format!("{program1} failed: {stderr1}"),
        });
    }

    if !output2.status.success() {
        let stderr = String::from_utf8_lossy(&output2.stderr);
        return Err(PipelineError::ToolCrash {
            code: output2.status.code().unwrap_or(-1),
            message: format!("{program2} failed: {stderr}"),
        });
    }

    Ok(ProcessOutput {
        exit_code: 0,
        stdout: String::from_utf8_lossy(&output2.stdout).to_string(),
        stderr: String::from_utf8_lossy(&output2.stderr).to_string(),
    })
}

/// Run a shell command string (for complex pipelines).
pub async fn run_shell(command: &str) -> Result<ProcessOutput, PipelineError> {
    info!(command, "running shell command");

    let output = Command::new("sh")
        .args(["-c", command])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| PipelineError::Other(format!("failed to spawn shell: {e}")))?
        .wait_with_output()
        .await
        .map_err(|e| PipelineError::Other(format!("failed to wait for shell: {e}")))?;

    let exit_code = output.status.code().unwrap_or(-1);
    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();

    #[cfg(unix)]
    {
        use std::os::unix::process::ExitStatusExt;
        if output.status.signal() == Some(9) {
            return Err(PipelineError::OutOfMemory);
        }
    }

    if !output.status.success() {
        return Err(PipelineError::ToolCrash {
            code: exit_code,
            message: format!("shell command failed: {}", stderr.trim()),
        });
    }

    Ok(ProcessOutput {
        exit_code,
        stdout,
        stderr,
    })
}
