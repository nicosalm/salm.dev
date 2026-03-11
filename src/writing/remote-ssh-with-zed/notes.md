# Blog Post Notes: Remote SSH to UW-Madison CS Lab with Zed

## Context
- Inspired by Shawn Zhong's 2019 blog post about doing this with VSCode: https://shawnzhong.com/2019/10/16/remote-ssh-to-cs-lab-with-vscode/
- Goal: replicate the same workflow using Zed editor instead of VSCode

## How VSCode Remote SSH Works (for comparison)
- Uses the "Remote - SSH" extension
- Key settings needed for UW CS lab (from Nico's VSCode settings.json):
  - `remote.SSH.showLoginTerminal: true` — shows password/Duo prompt
  - `remote.SSH.lockfilesInTmp: true` — redirects lock files to /tmp (AFS workaround)
  - `remote.SSH.useFlock: false` — disables flock (AFS doesn't support it)
  - `remote.SSH.remotePlatform`: configured for wisc.edu hosts as linux
- SSH config uses `Host uw` → `best-linux.cs.wisc.edu` with ControlMaster for connection reuse
- Works well once those AFS workarounds are in place

## How Zed Remote SSH Works (architecture difference)
- Zed separates UI (local) from backend (remote)
- Downloads/uploads a `zed-remote-server` binary to `~/.zed_server/` on the remote
- Creates Unix domain sockets in `~/.local/share/zed/server_state/` for IPC (stdin.sock, stdout.sock, stderr.sock)
- Establishes one SSH control master per project, multiplexes connections
- Connect via `Ctrl+Cmd+Shift+O` or `zed ssh://user@host/path`
- Settings go in `~/.config/zed/settings.json` under `ssh_connections`
- Supports `upload_binary_over_ssh: true` for restricted-network remotes

## Problems Encountered and Solutions

### Problem 1: Hanging at "Starting proxy..."
- **Root cause**: Powerlevel10k (p10k) instant prompt in `~/.zshrc` on the remote outputs content during shell startup, corrupting Zed's SSH protocol
- **Fix**: Add `[[ -o interactive ]] || return 0` as the VERY FIRST LINE of remote `~/.zshrc`
- Note: must be `return 0`, not just `return` — bare `return` propagates exit code 1 from the failed interactive test, which Zed interprets as a failure

### Problem 2: "Client exited with exit_code 1" (Unix sockets on AFS)
- **Root cause**: AFS (Andrew File System) does NOT support Unix domain sockets
- Zed creates `.sock` files in `~/.local/share/zed/server_state/setup-N/` for IPC
- On AFS, these socket files cannot be created, so the server crashes silently
- **Fix**: Symlink `~/.local/share/zed` to a local filesystem:
  ```bash
  mv ~/.local/share/zed ~/.local/share/zed.bak
  mkdir -p /tmp/zed-$USER
  ln -s /tmp/zed-$USER ~/.local/share/zed
  cp -r ~/.local/share/zed.bak/* /tmp/zed-$USER/ 2>/dev/null
  ```
- Note: `/tmp` is cleared on reboot, so add `mkdir -p /tmp/zed-$USER` to your `.zshrc` (after the interactive guard)

### Problem 3: "Client exited with exit_code 1" (load balancer)
- **Root cause**: `best-linux.cs.wisc.edu` is a DNS load balancer that routes to different physical machines
- Zed makes multiple SSH connections during setup (platform discovery, binary upload, server start, protocol connection)
- Each connection can land on a different machine (royal-01, royal-03, etc.)
- `/tmp` is per-machine, so the binary, sockets, and state are scattered across hosts
- **Fix**: Connect to a SPECIFIC machine instead of the load balancer
  ```
  # ~/.ssh/config
  Host uw-zed
      HostName vm-instunix-15.cs.wisc.edu  # or royal-01.cs.wisc.edu, etc.
      User salm
  ```
  Then use `uw-zed` as the host in Zed's ssh_connections config
- This is the same reason VSCode's Remote SSH config often uses specific hostnames

### Problem 4: Binary not found / upload issues
- Zed stores the remote server binary at `~/.zed_server/` (separate from `~/.local/share/zed/`)
- With `upload_binary_over_ssh: true`, Zed downloads the binary locally then SCPs it to the remote
- The binary at `~/.zed_server/` on AFS is fine — AFS handles regular files, just not sockets/locks
- Binary is ~90MB, named like `zed-remote-server-stable-0.221.5+stable.141.03bfbf242c57f7fdb45708d63d74182898edf2c5`
- Can manually download from: `https://github.com/zed-industries/zed/releases/download/v{VERSION}/zed-remote-server-linux-x86_64.gz`

## Working SSH Config
```
Host uw
    HostName best-linux.cs.wisc.edu
    User salm

Host uw-zed
    HostName vm-instunix-15.cs.wisc.edu   # specific machine, not load balancer
    User salm

Host *
    ControlMaster auto
    ControlPath ~/.ssh/%r@%h:%p
    ControlPersist 300s
```

## Working Zed Settings
```json
{
  "ssh_connections": [
    {
      "host": "vm-instunix-15.cs.wisc.edu",
      "username": "salm",
      "args": [],
      "projects": [
        {
          "paths": ["/home/salm"]
        }
      ]
    }
  ]
}
```

## Working Remote ~/.zshrc (first lines)
```bash
[[ -o interactive ]] || return 0
# rest of .zshrc (p10k, etc.)

# Ensure Zed temp dirs exist (cleared on reboot)
mkdir -p /tmp/zed-$USER
```

## Verified: Both AFS and Load Balancer Issues Are Real
- Tested by undoing all /tmp workarounds and connecting to a specific machine (vm-instunix-15)
- Result: hung on "Starting proxy" then "Client exited with exit_code 127"
- Exit code 127 = binary not found (expected since we cleared ~/.zed_server)
- The HANG confirms AFS socket issue is independently real — not just a side effect of load balancing
- Both fixes are required: specific hostname AND /tmp symlink for server_state

## Key Takeaways for the Blog Post
1. Zed's remote SSH works differently from VSCode — it uses Unix sockets instead of file locks
2. AFS doesn't support Unix sockets (VSCode's issues were with file locks — different problem, similar solution of using /tmp)
3. University lab load balancers break multi-connection tools — always use a specific hostname
4. Shell startup output (p10k, conda init, etc.) can corrupt SSH protocol channels
5. The fix requires changes on BOTH the remote (symlinks, zshrc guard) and local (specific hostname) sides
6. Once configured, Zed remote SSH works great — tree-sitter highlighting locally, language servers remotely
7. `upload_binary_over_ssh: true` is useful when the remote can't reach GitHub

## Comparison: VSCode vs Zed for Remote SSH on AFS
| Issue | VSCode Workaround | Zed Workaround |
|-------|------------------|----------------|
| AFS file locking | `lockfilesInTmp: true`, `useFlock: false` | Symlink `~/.local/share/zed` → `/tmp` |
| Login prompt | `showLoginTerminal: true` | Built-in SSH password dialog |
| Load balancer | Use specific hostname | Use specific hostname |
| Shell output | N/A (more resilient) | `[[ -o interactive ]] || return 0` in .zshrc |
| Binary delivery | Auto-downloads vscode-server | Auto-downloads zed-remote-server (or `upload_binary_over_ssh`) |

## Additional Details Worth Mentioning
- The `.__afs*` files: when browsing `~/.zed_server/` on AFS, you may see files like `.__afs4374` — these are AFS lock/temp artifacts, not real files. They can't be deleted ("Device or resource busy"). Harmless, just ignore them.
- 1Password SSH agent: Nico's setup uses 1Password as the SSH agent (`IdentityAgent "~/Library/Group Containers/2BUA8C4S2C.com.1password/t/agent.sock"`). This works fine with Zed — no special config needed.
- Duo two-factor auth: Zed handles password + keyboard-interactive auth (Duo push) through its built-in SSH dialog. Works out of the box.
- The double-open quirk: sometimes the first "Open Remote" attempt sends you back to the command palette. Just open it again — second attempt connects. Minor Zed bug, not related to AFS.
- `/tmp` persistence: on shared university machines, `/tmp` survives reboots on some systems but not others. The symlink setup needs `mkdir -p /tmp/zed-$USER` to be idempotent. Put it in `.zshrc` AFTER the interactive guard (inside the interactive block, or better, in `.zshenv` or `.zprofile`).
- Only `server_state` needs to be on local fs: we initially symlinked ALL of `~/.local/share/zed` to `/tmp`, but only the `server_state` subdirectory (which contains Unix sockets) strictly needs it. The rest (logs, extensions, languages) works fine on AFS. However, symlinking the whole thing is simpler and avoids future issues if Zed adds more socket/lock usage.
- Zed version must match: the remote server binary version must match your local Zed version exactly. If Zed auto-updates locally, it will re-download the matching remote binary on next connect.
- The debugging journey: error messages from Zed are opaque ("Client exited with exit_code 1") — the real debugging happens in Zed's log (`Cmd+Shift+P` → "zed: open log") and the remote server log (`~/.local/share/zed/logs/server-setup-*.log`). Both are essential for troubleshooting.
