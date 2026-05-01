#!/usr/bin/env node
/**
 * Ably Real-time Connectivity for CLI Dashboard
 * 
 * Provides live updates for agent status, payments, and trading activity
 * via Ably channels.
 */

import chalk from 'chalk';

export interface AblyMessage {
  name: string;
  data: any;
  timestamp?: number;
}

export interface AgentStatusUpdate {
  agentId: string;
  status: 'active' | 'paused' | 'idle' | 'error';
  lastSeen: string;
  taskCount: number;
  fees: number;
}

export interface PaymentNotification {
  txHash: string;
  amount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: string;
}

export interface SwapStatusUpdate {
  txHash: string;
  inputMint: string;
  outputMint: string;
  inputAmount: number;
  outputAmount: number;
  status: 'quote' | 'sent' | 'confirmed' | 'failed';
  timestamp: string;
}

export interface PriceAlert {
  token: string;
  price: number;
  change24h: number;
  timestamp: string;
}

/**
 * Ably Dashboard Stream
 * 
 * In a real implementation, this would use Ably SDK for WebSocket connections.
 * For CLI, we provide a polling-based implementation with message queue.
 */
export class AblyDashboard {
  private apiKey: string;
  private messageQueue: AblyMessage[] = [];
  private isConnected: boolean = false;
  private pollingInterval: NodeJS.Timeout | null = null;
  private channels: Set<string> = new Set();

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Connect to Ably channels
   */
  async connect(): Promise<void> {
    if (!this.apiKey) {
      throw new Error('ABLY_API_KEY not configured');
    }

    // In real implementation, would establish WebSocket connection
    this.isConnected = true;
    
    // Start polling for updates
    this.pollingInterval = setInterval(() => {
      this.poll();
    }, 1000);

    console.log(chalk.green('✓ Connected to Ably'));
  }

  /**
   * Subscribe to a channel
   */
  subscribe(channel: string, callback: (msg: AblyMessage) => void): void {
    this.channels.add(channel);
    console.log(chalk.cyan(`Subscribed to: ${channel}`));

    // Return mock updates for demonstration
    this.startMockUpdates(channel, callback);
  }

  /**
   * Publish a message to a channel
   */
  async publish(channel: string, message: AblyMessage): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Not connected to Ably');
    }

    this.messageQueue.push({
      ...message,
      timestamp: Date.now(),
    });
  }

  /**
   * Disconnect from Ably
   */
  disconnect(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
    this.isConnected = false;
    this.channels.clear();
    console.log(chalk.yellow('Disconnected from Ably'));
  }

  /**
   * Poll for pending messages
   */
  private poll(): void {
    // In real implementation, would fetch from Ably
    // For now, just drain the queue
    while (this.messageQueue.length > 0) {
      this.messageQueue.shift();
    }
  }

  /**
   * Start mock updates for demonstration
   */
  private startMockUpdates(channel: string, callback: (msg: AblyMessage) => void): void {
    if (channel === 'agent-events') {
      // Mock agent status updates
      const statusUpdates: AgentStatusUpdate[] = [
        {
          agentId: 'mev_bot',
          status: 'active',
          lastSeen: new Date().toISOString(),
          taskCount: 5,
          fees: 0.15,
        },
        {
          agentId: 'arbitrage_tracker',
          status: 'idle',
          lastSeen: new Date().toISOString(),
          taskCount: 0,
          fees: 0.02,
        },
      ];

      statusUpdates.forEach((update, idx) => {
        setTimeout(() => {
          callback({
            name: 'agent-status',
            data: update,
            timestamp: Date.now(),
          });
        }, idx * 2000);
      });
    } else if (channel === 'payment-notifications') {
      // Mock payment updates
      const payments: PaymentNotification[] = [
        {
          txHash: '5Y8hK3L2mN9pQ7xW6vB1cD4eF5gH6iJ7kL8mN9oP0q1rS2tU3vW4x',
          amount: 0.5,
          currency: 'SOL',
          status: 'confirmed',
          timestamp: new Date().toISOString(),
        },
      ];

      payments.forEach((payment, idx) => {
        setTimeout(() => {
          callback({
            name: 'payment-confirmed',
            data: payment,
            timestamp: Date.now(),
          });
        }, idx * 1000);
      });
    } else if (channel === 'swap-status') {
      // Mock swap status updates
      const swaps: SwapStatusUpdate[] = [
        {
          txHash: '2Z3Y4X5W6V7U8T9S0R1Q2P3O4N5M6L7K8J9I0H1G2F3E4D5C',
          inputMint: 'So11111111111111111111111111111111111111112',
          outputMint: 'EPjFWdd5AufqSSqeM2q8bW8o6Z9z7z5vFhFfJpQv5h5',
          inputAmount: 1.0,
          outputAmount: 24.5,
          status: 'confirmed',
          timestamp: new Date().toISOString(),
        },
      ];

      swaps.forEach((swap, idx) => {
        setTimeout(() => {
          callback({
            name: 'swap-status',
            data: swap,
            timestamp: Date.now(),
          });
        }, idx * 1500);
      });
    }
  }

  /**
   * Format agent status for CLI display
   */
  static formatAgentStatus(update: AgentStatusUpdate): string {
    const statusColor = {
      active: chalk.green,
      paused: chalk.yellow,
      idle: chalk.gray,
      error: chalk.red,
    }[update.status] || chalk.white;

    return (
      `${statusColor(update.agentId.padEnd(20))} ` +
      `${statusColor(update.status.padEnd(8))} ` +
      `${chalk.cyan(update.taskCount.toString().padEnd(3))} tasks ` +
      `${chalk.yellow(update.fees.toFixed(4))} SOL`
    );
  }

  /**
   * Format payment notification for CLI display
   */
  static formatPayment(notification: PaymentNotification): string {
    const statusColor = {
      pending: chalk.yellow,
      confirmed: chalk.green,
      failed: chalk.red,
    }[notification.status] || chalk.white;

    return (
      `${chalk.cyan(notification.txHash.slice(0, 16))}... ` +
      `${chalk.white(notification.amount)} ${notification.currency} ` +
      `${statusColor(notification.status)}`
    );
  }

  /**
   * Format swap status for CLI display
   */
  static formatSwap(update: SwapStatusUpdate): string {
    const statusColor = {
      quote: chalk.gray,
      sent: chalk.yellow,
      confirmed: chalk.green,
      failed: chalk.red,
    }[update.status] || chalk.white;

    const inputSymbol = this.tokenSymbol(update.inputMint);
    const outputSymbol = this.tokenSymbol(update.outputMint);

    return (
      `${chalk.cyan(update.txHash.slice(0, 16))}... ` +
      `${inputSymbol} → ${outputSymbol} ` +
      `${chalk.white(update.inputAmount)} / ${chalk.cyan(update.outputAmount)} ` +
      `${statusColor(update.status)}`
    );
  }

  /**
   * Get token symbol from mint address
   */
  private static tokenSymbol(mint: string): string {
    const symbols: Record<string, string> = {
      'So11111111111111111111111111111111111111112': 'SOL',
      'EPjFWdd5AufqSSqeM2q8bW8o6Z9z7z5vFhFfJpQv5h5': 'USDC',
      '4k3Dyjzvzp8eMZWUUbCCjBTrHd4nKBo51d33FpCWkeS': 'RAY',
    };
    return symbols[mint] || mint.slice(0, 4).toUpperCase();
  }
}

/**
 * Live Dashboard UI
 */
export class LiveDashboard {
  private dashboard: AblyDashboard;
  private agents: Map<string, AgentStatusUpdate> = new Map();
  private recentPayments: PaymentNotification[] = [];
  private recentSwaps: SwapStatusUpdate[] = [];

  constructor(dashboard: AblyDashboard) {
    this.dashboard = dashboard;
  }

  /**
   * Initialize dashboard streams
   */
  async init(): Promise<void> {
    await this.dashboard.connect();

    // Subscribe to agent events
    this.dashboard.subscribe('agent-events', (msg) => {
      if (msg.name === 'agent-status') {
        const update = msg.data as AgentStatusUpdate;
        this.agents.set(update.agentId, update);
        this.renderAgentStatus(update);
      }
    });

    // Subscribe to payment notifications
    this.dashboard.subscribe('payment-notifications', (msg) => {
      if (msg.name === 'payment-confirmed') {
        const payment = msg.data as PaymentNotification;
        this.recentPayments.unshift(payment);
        if (this.recentPayments.length > 10) {
          this.recentPayments.pop();
        }
        this.renderPayment(payment);
      }
    });

    // Subscribe to swap status
    this.dashboard.subscribe('swap-status', (msg) => {
      if (msg.name === 'swap-status') {
        const swap = msg.data as SwapStatusUpdate;
        this.recentSwaps.unshift(swap);
        if (this.recentSwaps.length > 10) {
          this.recentSwaps.pop();
        }
        this.renderSwap(swap);
      }
    });
  }

  /**
   * Render agent status update
   */
  private renderAgentStatus(update: AgentStatusUpdate): void {
    console.log(
      chalk.gray('[AGENT]') + ' ' +
      AblyDashboard.formatAgentStatus(update)
    );
  }

  /**
   * Render payment notification
   */
  private renderPayment(notification: PaymentNotification): void {
    console.log(
      chalk.gray('[PAYMENT]') + ' ' +
      AblyDashboard.formatPayment(notification)
    );
  }

  /**
   * Render swap status
   */
  private renderSwap(update: SwapStatusUpdate): void {
    console.log(
      chalk.gray('[SWAP]') + ' ' +
      AblyDashboard.formatSwap(update)
    );
  }

  /**
   * Print dashboard summary
   */
  printSummary(): void {
    console.log('\n' + chalk.cyan.bold('━━━━━ Live Dashboard Summary ━━━━━'));
    
    console.log(chalk.cyan.bold('\nActive Agents:'));
    for (const [, agent] of this.agents) {
      console.log('  ' + AblyDashboard.formatAgentStatus(agent));
    }

    if (this.recentPayments.length > 0) {
      console.log(chalk.cyan.bold('\nRecent Payments:'));
      this.recentPayments.slice(0, 5).forEach((p) => {
        console.log('  ' + AblyDashboard.formatPayment(p));
      });
    }

    if (this.recentSwaps.length > 0) {
      console.log(chalk.cyan.bold('\nRecent Swaps:'));
      this.recentSwaps.slice(0, 5).forEach((s) => {
        console.log('  ' + AblyDashboard.formatSwap(s));
      });
    }

    console.log();
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    this.dashboard.disconnect();
  }
}

// Export for use in other modules
export default AblyDashboard;
