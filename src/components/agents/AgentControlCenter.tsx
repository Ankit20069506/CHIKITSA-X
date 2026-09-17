import React, { useState, useEffect } from 'react';
import type { AppLanguage, AutonomousAgentStatus, MasterAuditLogEntry } from '../../types';
import { agentSwarm } from '../../services/agentSwarm';
import { db } from '../../db/database';
import {
  Bot,
  Activity,
  Play,
  Pause,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shield,
  Zap,
  Terminal,
  Cpu
} from 'lucide-react';

interface Props {
  language: AppLanguage;
}

export const AgentControlCenter: React.FC<Props> = ({ language }) => {
  const [agents, setAgents] = useState<AutonomousAgentStatus[]>(() => agentSwarm.getAgents());
  const [isRunning, setIsRunning] = useState<boolean>(() => agentSwarm.getIsRunning());
  const [auditLogs, setAuditLogs] = useState<MasterAuditLogEntry[]>(() => db.getAuditLogs());
  const [selectedAgentId, setSelectedAgentId] = useState<string>(agents[0]?.id || '');

  useEffect(() => {
    const unsubAgents = db.subscribe('agents', () => {
      setAgents(agentSwarm.getAgents());
    });
    const unsubAudit = db.subscribe('audit', () => {
      setAuditLogs(db.getAuditLogs());
    });
    const unsubTelemetry = db.subscribe('telemetry', () => {
      setAgents(agentSwarm.getAgents());
    });

    const interval = setInterval(() => {
      setAgents(agentSwarm.getAgents());
      setIsRunning(agentSwarm.getIsRunning());
    }, 2000);

    return () => {
      unsubAgents();
      unsubAudit();
      unsubTelemetry();
      clearInterval(interval);
    };
  }, []);

  const handleToggleSwarm = () => {
    if (isRunning) {
      agentSwarm.stop();
      setIsRunning(false);
    } else {
      agentSwarm.start();
      setIsRunning(true);
    }
  };

  const selectedAgent = agents.find(a => a.id === selectedAgentId) || agents[0];

  return (
    <div>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.1) 0%, rgba(147, 51, 234, 0.08) 50%, rgba(16, 185, 129, 0.08) 100%)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0284c7 0%, #9333ea 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)'
          }}>
            <Cpu size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                {language === 'HI' ? 'स्वायत्त मल्टी-एजेंट नियंत्रण केंद्र (Autonomous Agent Swarm)' : 'Autonomous Multi-Agent Swarm Control Center'}
              </h2>
              <span className={`badge ${isRunning ? 'badge-green' : 'badge-amber'}`} style={{ fontSize: '0.7rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isRunning ? '#10b981' : '#f59e0b', display: 'inline-block', marginRight: '4px' }} />
                {isRunning ? 'Swarm Running (Live)' : 'Swarm Paused'}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {language === 'HI'
                ? '5 स्वायत्त एआई एजेंट्स जो रीयल-टाइम में ओपीडी टोकन, आईसीयू बेड, ब्लड बैंक व बीमा प्री-ऑथ को स्वचालित रूप से फेच और अपडेट करते हैं।'
                : '5 background worker agents continuously synchronizing live OPD queues, hospital ICU telemetry, blood reserves, and pre-auth claims.'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleToggleSwarm}
            className={isRunning ? 'btn btn-secondary btn-sm' : 'btn btn-green btn-sm'}
          >
            {isRunning ? <Pause size={14} /> : <Play size={14} />}
            {isRunning ? 'Pause Swarm' : 'Resume Swarm'}
          </button>
        </div>
      </div>

      {/* Agents Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {agents.map(agent => {
          const isSelected = selectedAgentId === agent.id;
          return (
            <div
              key={agent.id}
              onClick={() => setSelectedAgentId(agent.id)}
              className="glass-panel"
              style={{
                padding: '18px',
                cursor: 'pointer',
                border: `1px solid ${isSelected ? 'var(--medical-blue)' : 'var(--border-subtle)'}`,
                background: isSelected ? 'rgba(2, 132, 199, 0.05)' : 'var(--bg-card)',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: isRunning ? '#10b981' : '#f59e0b', animation: isRunning ? 'pulse 1.5s infinite' : 'none' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--medical-blue)' }}>
                    {agent.id}
                  </span>
                </div>
                <span className="badge badge-teal" style={{ fontSize: '0.65rem' }}>
                  Every {agent.intervalSeconds}s
                </span>
              </div>

              <h4 style={{ margin: '0 0 4px', fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {agent.name}
              </h4>
              <p style={{ margin: '0 0 10px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {agent.role}
              </p>

              <div style={{ background: 'var(--bg-secondary)', padding: '8px 10px', borderRadius: '6px', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                <strong style={{ color: 'var(--text-main)' }}>Latest Pulse:</strong> {agent.lastLogMessage}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <span>Processed: <strong>{agent.metricsProcessedCount} events</strong></span>
                <span>Active: <strong>{agent.lastExecutionTime}</strong></span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Bottom Section: Live Selected Agent Log + System Audit Trail */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Selected Agent Live Stream */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.05rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal size={18} style={{ color: 'var(--medical-blue)' }} />
              Live Activity Stream: {selectedAgent.name}
            </h3>
            <span className="badge badge-purple" style={{ fontSize: '0.68rem' }}>
              {selectedAgent.recentLogs.length} Records
            </span>
          </div>

          <div style={{
            background: '#090d16',
            borderRadius: '8px',
            padding: '14px',
            fontFamily: 'monospace',
            fontSize: '0.78rem',
            maxHeight: '340px',
            overflowY: 'auto',
            border: '1px solid var(--border-subtle)'
          }}>
            {selectedAgent.recentLogs.map((log, index) => {
              const color =
                log.level === 'SUCCESS' ? '#34d399' :
                log.level === 'WARNING' ? '#fbbf24' :
                log.level === 'CRITICAL' ? '#f87171' : '#60a5fa';
              return (
                <div key={index} style={{ marginBottom: '8px', lineHeight: '1.4' }}>
                  <span style={{ color: '#6b7280', marginRight: '8px' }}>[{log.timestamp}]</span>
                  <span style={{ color, fontWeight: 700, marginRight: '8px' }}>[{log.level}]</span>
                  <span style={{ color: '#e5e7eb' }}>{log.message}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Master ABDM System Audit Trail */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.05rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} style={{ color: 'var(--accent-green)' }} />
              Master Database ABDM Audit Trail
            </h3>
            <span className="badge badge-green" style={{ fontSize: '0.68rem' }}>
              M1 / M2 / M3 Log
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '340px', overflowY: 'auto' }}>
            {auditLogs.map(log => (
              <div
                key={log.id}
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.78rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                    {log.actor} ({log.actorRole})
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {log.timestamp}
                  </span>
                </div>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  {log.details}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem' }}>
                  <span style={{ color: 'var(--medical-blue)' }}>Target: {log.resourceTarget}</span>
                  <span className="badge badge-teal" style={{ fontSize: '0.62rem' }}>{log.abdmComplianceTag}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
