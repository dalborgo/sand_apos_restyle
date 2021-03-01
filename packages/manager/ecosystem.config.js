module.exports = {
  apps: [
    {
      env: {
        NODE_ENV: 'production',
        NODE_OPTIONS: '--max-old-space-size=4096',
      },
      log_date_format: 'DD-MM-YYYY HH:mm',
      name: 'Back DEV Next Astenpos',
      node_args: '-r esm',
      restart_delay: 4000,
      script: 'src/index.js',
    },
  ],
}
