module.exports = {
    apps: [
        {
            name: 'applicant-upload-task',
            script: 'app/queues/consumers/applicants/upload.js',
            args: '',
            instances: 1,
            autorestart: true,
            exec_mode: 'fork',
            watch: false,
            max_memory_restart: '1G',
            env_development: {
                NODE_ENV: 'development',
                PORT: 5006
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 5006
            },
            env_staging: {
                NODE_ENV: 'staging',
                PORT: 5006
            }
        },
         {
            name: 'create-aku-account-task',
            script: 'app/queues/consumers/applicants/create_aku_account.js',
            args: '',
            instances: 1,
            autorestart: true,
            exec_mode: 'fork',
            watch: false,
            max_memory_restart: '1G',
            env_development: {
                NODE_ENV: 'development',
                PORT: 5006
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 5006
            },
            env_staging: {
                NODE_ENV: 'staging',
                PORT: 5006
            }
          },
        {
            name: 'applicant-payment-task',
            script: 'app/queues/consumers/applicants/pay_applicant.js',
            args: '',
            instances: 1,
            autorestart: true,
            exec_mode: 'fork',
            watch: false,
            max_memory_restart: '1G',
            env_development: {
                NODE_ENV: 'development',
                PORT: 5006
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 5006
            },
            env_staging: {
                NODE_ENV: 'staging',
                PORT: 5006
            }
        },
        {
            name: 'process-applicant-payment-task',
            script: 'app/queues/consumers/applicants/process_applicant_payment.js',
            args: '',
            instances: 1,
            autorestart: true,
            exec_mode: 'fork',
            watch: false,
            max_memory_restart: '1G',
            env_development: {
                NODE_ENV: 'development',
                PORT: 5006
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 5006
            },
            env_staging: {
                NODE_ENV: 'staging',
                PORT: 5006
            }
        },
        {
            name: 'exports-transaction-queue',
            script: 'app/queues/consumers/transactions/export.js',
            args: '',
            instances: 1,
            autorestart: true,
            exec_mode: 'fork',
            watch: false,
            max_memory_restart: '100M',
            env_development: {
                NODE_ENV: 'development',
                PORT: 5006
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 5006
            },
            env_staging: {
                NODE_ENV: 'staging',
                PORT: 5006
            }
        },
        {
            name: 'process-applicant-sms960-sms-status',
            script: 'app/queues/consumers/applicants/process_applicant_sms_status.js',
            args: '',
            instances: 1,
            autorestart: true,
            exec_mode: 'fork',
            watch: false,
            max_memory_restart: '100M',
            env_development: {
                NODE_ENV: 'development',
                PORT: 5006
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 5006
            },
            env_staging: {
                NODE_ENV: 'staging',
                PORT: 5006
            }
        },
        {
            name: 'send-exported-transaction-queue',
            script: 'app/queues/consumers/transactions/send_export.js',
            args: '',
            instances: 1,
            autorestart: true,
            exec_mode: 'fork',
            watch: false,
            max_memory_restart: '100M',
            env_development: {
                NODE_ENV: 'development',
                PORT: 5006
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 5006
            },
            env_staging: {
                NODE_ENV: 'staging',
                PORT: 5006
            }
        },
        {
            name: 'exports-funds-queue',
            script: 'app/queues/consumers/funds/export.js',
            args: '',
            instances: 1,
            autorestart: true,
            exec_mode: 'fork',
            watch: false,
            max_memory_restart: '100M',
            env_development: {
                NODE_ENV: 'development',
                PORT: 5006
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 5006
            },
            env_staging: {
                NODE_ENV: 'staging',
                PORT: 5006
            }
        },
        {
            name: 'send-exported-funds-queue',
            script: 'app/queues/consumers/funds/send_export.js',
            args: '',
            instances: 1,
            autorestart: true,
            exec_mode: 'fork',
            watch: false,
            max_memory_restart: '100M',
            env_development: {
                NODE_ENV: 'development',
                PORT: 5006
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 5006
            },
            env_staging: {
                NODE_ENV: 'staging',
                PORT: 5006
            }
        },
        {
            name: 'send-exported-applicant-reply-queue',
            script: 'app/queues/consumers/applicants/export_applicant_reply.js',
            args: '',
            instances: 1,
            autorestart: true,
            exec_mode: 'fork',
            watch: false,
            max_memory_restart: '100M',
            env_development: {
                NODE_ENV: 'development',
                PORT: 5006
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 5006
            },
            env_staging: {
                NODE_ENV: 'staging',
                PORT: 5006
            }
        },
        {
            name: 'exports-cashout-queue',
            script: 'app/queues/consumers/cashout/export.js',
            args: '',
            instances: 1,
            autorestart: true,
            exec_mode: 'fork',
            watch: false,
            max_memory_restart: '100M',
            env_development: {
                NODE_ENV: 'development',
                PORT: 5006
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 5006
            },
            env_staging: {
                NODE_ENV: 'staging',
                PORT: 5006
            }
        },
        {
            name: 'send-exported-cashout-queue',
            script: 'app/queues/consumers/cashout/send_export.js',
            args: '',
            instances: 1,
            autorestart: true,
            exec_mode: 'fork',
            watch: false,
            max_memory_restart: '100M',
            env_development: {
                NODE_ENV: 'development',
                PORT: 5006
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 5006
            },
            env_staging: {
                NODE_ENV: 'staging',
                PORT: 5006
            }
        },
        {
            name: 'exports-sms-logs-queue',
            script: 'app/queues/consumers/smsLogs/export.js',
            args: '',
            instances: 1,
            autorestart: true,
            exec_mode: 'fork',
            watch: false,
            max_memory_restart: '100M',
            env_development: {
                NODE_ENV: 'development',
                PORT: 5006
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 5006
            },
            env_staging: {
                NODE_ENV: 'staging',
                PORT: 5006
            }
        },
        {
            name: 'send-exported-sms-logs-queue',
            script: 'app/queues/consumers/smsLogs/send_export.js',
            args: '',
            instances: 1,
            autorestart: true,
            exec_mode: 'fork',
            watch: false,
            max_memory_restart: '100M',
            env_development: {
                NODE_ENV: 'development',
                PORT: 5006
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 5006
            },
            env_staging: {
                NODE_ENV: 'staging',
                PORT: 5006
            }
        },
        {
            name: 'exports-webHook-Logs-queue',
            script: 'app/queues/consumers/webHookLogs/export.js',
            args: '',
            instances: 1,
            autorestart: true,
            exec_mode: 'fork',
            watch: false,
            max_memory_restart: '100M',
            env_development: {
                NODE_ENV: 'development',
                PORT: 5006
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 5006
            },
            env_staging: {
                NODE_ENV: 'staging',
                PORT: 5006
            }
        },
        {
            name: 'send-exported-webHook-Logs-queue',
            script: 'app/queues/consumers/webHookLogs/send_export.js',
            args: '',
            instances: 1,
            autorestart: true,
            exec_mode: 'fork',
            watch: false,
            max_memory_restart: '100M',
            env_development: {
                NODE_ENV: 'development',
                PORT: 5006
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 5006
            },
            env_staging: {
                NODE_ENV: 'staging',
                PORT: 5006
            }
        },
        {
            name: 'exports-retracted-queue',
            script: 'app/queues/consumers/retracted/export.js',
            args: '',
            instances: 1,
            autorestart: true,
            exec_mode: 'fork',
            watch: false,
            max_memory_restart: '100M',
            env_development: {
                NODE_ENV: 'development',
                PORT: 5006
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 5006
            },
            env_staging: {
                NODE_ENV: 'staging',
                PORT: 5006
            }
        },
        {
            name: 'send-exported-retracted-queue',
            script: 'app/queues/consumers/retracted/send_export.js',
            args: '',
            instances: 1,
            autorestart: true,
            exec_mode: 'fork',
            watch: false,
            max_memory_restart: '100M',
            env_development: {
                NODE_ENV: 'development',
                PORT: 5006
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 5006
            },
            env_staging: {
                NODE_ENV: 'staging',
                PORT: 5006
            }
        },
        {
            name: 'upload-account-queue',
            script: 'app/queues/consumers/beneficiary/upload.js',
            args: '',
            instances: 1,
            autorestart: true,
            exec_mode: 'fork',
            watch: false,
            max_memory_restart: '100M',
            env_development: {
                NODE_ENV: 'development',
            },
            env_production: {
                NODE_ENV: 'production',
            },
            env_staging: {
                NODE_ENV: 'staging',
            }
        },
        {
            name: 'send-upload-account-queue',
            script: 'app/queues/consumers/beneficiary/send.js',
            args: '',
            instances: 1,
            autorestart: true,
            exec_mode: 'fork',
            watch: false,
            max_memory_restart: '100M',
            env_development: {
                NODE_ENV: 'development',
            },
            env_production: {
                NODE_ENV: 'production',
            },
            env_staging: {
                NODE_ENV: 'staging',
            }
        },
        {
            name: 'upload-error-logs-queue',
            script: 'app/queues/consumers/uploadError/export.js',
            args: '',
            instances: 1,
            autorestart: true,
            exec_mode: 'fork',
            watch: false,
            max_memory_restart: '100M',
            env_development: {
                NODE_ENV: 'development',
            },
            env_production: {
                NODE_ENV: 'production',
            },
            env_staging: {
                NODE_ENV: 'staging',
            }
        },
        {
            name: 'send-upload-error-logs-queue',
            script: 'app/queues/consumers/uploadError/send_export.js',
            args: '',
            instances: 1,
            autorestart: true,
            exec_mode: 'fork',
            watch: false,
            max_memory_restart: '100M',
            env_development: {
                NODE_ENV: 'development',
            },
            env_production: {
                NODE_ENV: 'production',
            },
            env_staging: {
                NODE_ENV: 'staging',
            }
        },
    ],

    deploy: {
        production: {
            user: 'node',
            host: '212.83.163.1',
            ref: 'origin/master',
            repo: 'git@github.com:repo.git',
            path: '/var/www/production',
            'post-deploy':
        'npm install && pm2 reload ecosystem.config.js --env production'
        }
    }
};
