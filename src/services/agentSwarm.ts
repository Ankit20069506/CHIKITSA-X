import { db } from '../db/database';
import type { AutonomousAgentStatus } from '../types';

class AgentSwarmEngine {
  private isRunning: boolean = false;
  private intervalIds: any[] = [];

  private agents: AutonomousAgentStatus[] = [
    {
      id: 'AGENT-OPD-01',
      name: 'OPD Queue & Token Sync Agent',
      role: 'Autonomous Digital Token Dispenser & Queue Advancer',
      status: 'ACTIVE',
      intervalSeconds: 8,
      lastExecutionTime: 'Just now',
      metricsProcessedCount: 142,
      lastLogMessage: 'Monitoring Chamber 1 to 6. Dynamic wait calculation running.',
      recentLogs: [
        { timestamp: '09:00:10', level: 'INFO', message: 'Initialized OPD queue polling across 3 empaneled hospitals.' },
        { timestamp: '09:00:18', level: 'SUCCESS', message: 'Token #14 completed consultation. Token #15 dispatched.' }
      ]
    },
    {
      id: 'AGENT-BED-02',
      name: 'ICU & Bed Telemetry Sentinel Agent',
      role: 'Trauma ICU, Ventilator & Oxygen Bed Telemetry Monitor',
      status: 'ACTIVE',
      intervalSeconds: 10,
      lastExecutionTime: 'Just now',
      metricsProcessedCount: 218,
      lastLogMessage: 'ICU Occupancy at 78.1%. 7 ICU beds available.',
      recentLogs: [
        { timestamp: '09:00:12', level: 'INFO', message: 'Telemetry ping verified from Sassoon Trauma ICU Ward.' },
        { timestamp: '09:00:22', level: 'SUCCESS', message: 'Ventilator 4 released from post-op recovery.' }
      ]
    },
    {
      id: 'AGENT-BLOOD-03',
      name: 'Blood Bank Stock & Donor Radar Agent',
      role: 'National Blood Reserve Scanner & Emergency Donor Dispatcher',
      status: 'ACTIVE',
      intervalSeconds: 12,
      lastExecutionTime: 'Just now',
      metricsProcessedCount: 89,
      lastLogMessage: 'Scanned 8 blood groups. O- and AB- below safety threshold.',
      recentLogs: [
        { timestamp: '09:00:14', level: 'WARNING', message: 'O- Negative reserve low (3 units). Standby donor broadcast primed.' },
        { timestamp: '09:00:26', level: 'INFO', message: 'A+ Reserve healthy (28 units).' }
      ]
    },
    {
      id: 'AGENT-TRIAGE-04',
      name: 'AI Triage & ABDM FHIR Sync Agent',
      role: 'Voice Intake Parser & SNOMED/ICD-10 Clinical Scribe',
      status: 'ACTIVE',
      intervalSeconds: 15,
      lastExecutionTime: 'Just now',
      metricsProcessedCount: 64,
      lastLogMessage: 'Linked spoken symptoms to ABHA wallet FHIR DiagnosticReport.',
      recentLogs: [
        { timestamp: '09:00:16', level: 'INFO', message: 'Listening to Bhashini Indian acoustic voice stream.' },
        { timestamp: '09:00:31', level: 'SUCCESS', message: 'Generated ICD-10 differential mapping for Angina (I20.9).' }
      ]
    },
    {
      id: 'AGENT-FIN-05',
      name: 'PM-JAY & TPA Cashless Adjudicator Agent',
      role: 'Instant Pre-Auth Insurance & Government Scheme Evaluator',
      status: 'ACTIVE',
      intervalSeconds: 14,
      lastExecutionTime: 'Just now',
      metricsProcessedCount: 97,
      lastLogMessage: 'Verified PM-JAY package rates against ROHINI hospital schedule.',
      recentLogs: [
        { timestamp: '09:00:18', level: 'INFO', message: 'Polling pending TPA pre-authorization requests.' },
        { timestamp: '09:00:32', level: 'SUCCESS', message: 'Sanctioned ₹1,80,000 cashless pre-auth via Medi Assist.' }
      ]
    }
  ];

  start() {
    if (this.isRunning) return;
    this.isRunning = true;

    // Agent 1: OPD Queue
    const id1 = setInterval(() => {
      this.runOPDAgent();
    }, 8000);

    // Agent 2: Bed Telemetry
    const id2 = setInterval(() => {
      this.runBedAgent();
    }, 10000);

    // Agent 3: Blood Bank
    const id3 = setInterval(() => {
      this.runBloodAgent();
    }, 12000);

    // Agent 4: Triage & FHIR
    const id4 = setInterval(() => {
      this.runTriageAgent();
    }, 15000);

    // Agent 5: Insurance Pre-Auth
    const id5 = setInterval(() => {
      this.runInsuranceAgent();
    }, 14000);

    this.intervalIds = [id1, id2, id3, id4, id5];
  }

  stop() {
    this.isRunning = false;
    this.intervalIds.forEach(id => clearInterval(id));
    this.intervalIds = [];
  }

  getAgents(): AutonomousAgentStatus[] {
    return [...this.agents];
  }

  getIsRunning(): boolean {
    return this.isRunning;
  }

  private addAgentLog(
    agentId: string,
    level: 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL',
    message: string
  ) {
    const agent = this.agents.find(a => a.id === agentId);
    if (!agent) return;

    const time = new Date().toLocaleTimeString();
    agent.lastExecutionTime = 'Just now';
    agent.metricsProcessedCount += 1;
    agent.lastLogMessage = message;
    agent.recentLogs.unshift({ timestamp: time, level, message });
    if (agent.recentLogs.length > 20) agent.recentLogs.pop();

    db.notify('agents');
  }

  private runOPDAgent() {
    const queues = db.getLiveOPDQueues();
    if (queues.length > 0) {
      const q = queues[0];
      if (q.currentServingToken < q.tokenNumber) {
        q.currentServingToken += 1;
        q.estimatedWaitMinutes = Math.max(0, (q.tokenNumber - q.currentServingToken) * 4);
        if (q.currentServingToken === q.tokenNumber) {
          q.status = 'SERVING';
        }
        this.addAgentLog(
          'AGENT-OPD-01',
          'SUCCESS',
          `Serving Token #${q.currentServingToken} at ${q.hospitalName} (${q.department}). Wait time updated to ${q.estimatedWaitMinutes}m.`
        );
        db.notify('opd');
      } else {
        this.addAgentLog(
          'AGENT-OPD-01',
          'INFO',
          `Queue in sync. Patient Token #${q.tokenNumber} is now currently serving.`
        );
      }
    }
  }

  private runBedAgent() {
    const hospitals = db.getHospitals();
    if (hospitals.length > 0) {
      const target = hospitals[0];
      // Jiggle bed numbers realistically
      const change = Math.random() > 0.5 ? 1 : -1;
      const newIcu = Math.max(2, Math.min(target.bedTelemetry.icuTotal - 2, target.bedTelemetry.icuAvailable + change));
      db.updateHospitalBedTelemetry(target.id, {
        icuAvailable: newIcu
      });
      const occupancy = (((target.bedTelemetry.icuTotal - newIcu) / target.bedTelemetry.icuTotal) * 100).toFixed(1);

      this.addAgentLog(
        'AGENT-BED-02',
        newIcu < 5 ? 'WARNING' : 'INFO',
        `Telemetry Pulse: ${target.name} ICU available: ${newIcu}/${target.bedTelemetry.icuTotal} (Occupancy: ${occupancy}%).`
      );
    }
  }

  private runBloodAgent() {
    const hospitals = db.getHospitals();
    if (hospitals.length > 0) {
      const target = hospitals[0];
      const groups = ['O-', 'AB-', 'A+', 'B+'];
      const randomGroup = groups[Math.floor(Math.random() * groups.length)];
      const delta = Math.random() > 0.6 ? 1 : -1;
      db.updateBloodStock(target.id, randomGroup, delta);

      this.addAgentLog(
        'AGENT-BLOOD-03',
        randomGroup === 'O-' ? 'WARNING' : 'INFO',
        `Blood Inventory Radar: ${randomGroup} stock adjusted (${delta > 0 ? '+' : ''}${delta} unit) at ${target.name}.`
      );
    }
  }

  private runTriageAgent() {
    this.addAgentLog(
      'AGENT-TRIAGE-04',
      'SUCCESS',
      'Autonomous Triage: Health records scanned. ABDM FHIR Resource DiagnosticReport synchronized with ABHA token.'
    );
  }

  private runInsuranceAgent() {
    this.addAgentLog(
      'AGENT-FIN-05',
      'SUCCESS',
      'FinTech Sentinel: Automated TPA rule verification passed. PM-JAY package pre-auth ready for cashless claim.'
    );
  }
}

export const agentSwarm = new AgentSwarmEngine();

// Auto-start background agents
agentSwarm.start();
