{
  "apps": [
    {
      "name": "file-share",
      "script": "src/index.js",
      "args": "--start",
      "instances": 1,
      "exec_mode": "fork",
      "watch": false,
      "max_memory_restart": "500M",
      "env": {
        "NODE_ENV": "production"
      },
      "error_file": "./logs/err.log",
      "out_file": "./logs/out.log",
      "log_file": "./logs/combined.log",
      "time": true,
      "autorestart": true,
      "max_restarts": 10,
      "min_uptime": "10s",
      "restart_delay": 4000
    }
  ]
}