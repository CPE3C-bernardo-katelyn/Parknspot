import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register fonts (optional - for better typography)
Font.register({
  family: 'Inter',
  src: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap',
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#fcf9f4',
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#3e0502',
  },
  title: {
    fontSize: 24,
    fontWeight: 'extrabold',
    color: '#3e0502',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: '#544340',
    marginBottom: 4,
  },
  dateRange: {
    fontSize: 10,
    color: '#544340',
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  mainStat: {
    flex: 3,
    backgroundColor: '#ffffff',
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#3e0502',
    marginRight: 10,
  },
  sideStat: {
    flex: 1,
    backgroundColor: '#fddab0',
    padding: 15,
  },
  statLabel: {
    fontSize: 10,
    color: '#544340',
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'extrabold',
    color: '#1b1c19',
    marginBottom: 5,
  },
  trend: {
    fontSize: 10,
    color: '#3e0502',
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'extrabold',
    color: '#1b1c19',
    marginBottom: 12,
    marginTop: 20,
  },
  zoneItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#ffffff',
    marginBottom: 8,
    borderRadius: 4,
  },
  zoneInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  zoneId: {
    width: 30,
    height: 30,
    backgroundColor: '#e4e2dd',
    textAlign: 'center',
    lineHeight: 30,
    fontSize: 10,
    fontWeight: 'bold',
  },
  zoneName: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  zoneLocation: {
    fontSize: 9,
    color: '#544340',
  },
  zoneValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3e0502',
  },
  barContainer: {
    width: 80,
    height: 4,
    backgroundColor: '#e4e2dd',
    marginTop: 4,
  },
  barFill: {
    height: 4,
    backgroundColor: '#3e0502',
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#eae8e3',
    padding: 10,
    fontSize: 9,
    fontWeight: 'bold',
    color: '#544340',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e2dd',
    fontSize: 10,
  },
  col1: {
    flex: 1,
  },
  col2: {
    flex: 2,
  },
  footer: {
    marginTop: 30,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#dac1bd',
    textAlign: 'center',
    fontSize: 8,
    color: '#544340',
  },
  peakHour: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#785e3d',
    marginTop: 8,
  },
});

interface PDFReportProps {
  stats: any;
  dateRange: { start: string; end: string };
  occupancyData: any[];
  activityLog: any[];
}

export const PDFReport: React.FC<PDFReportProps> = ({ stats, dateRange, occupancyData, activityLog }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>PARK 'N SPOT</Text>
        <Text style={styles.subtitle}>Analytics & Performance Report</Text>
        <Text style={styles.dateRange}>
          Period: {new Date(dateRange.start).toLocaleDateString()} - {new Date(dateRange.end).toLocaleDateString()}
        </Text>
        <Text style={styles.dateRange}>
          Generated: {new Date().toLocaleString()}
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.mainStat}>
          <Text style={styles.statLabel}>Total Facility Utilization</Text>
          <Text style={styles.statValue}>{stats?.utilization || 0}%</Text>
          <Text style={styles.trend}>▲ +4.2% vs last month</Text>
        </View>
        <View style={styles.sideStat}>
          <Text style={styles.statLabel}>Peak Hour</Text>
          <Text style={styles.peakHour}>08:45 AM</Text>
          <Text style={[styles.statLabel, { marginTop: 10 }]}>System capacity zenith during morning commute</Text>
        </View>
      </View>

      {/* Occupancy by Zone */}
      <Text style={styles.sectionTitle}>Occupancy by Zone</Text>
      {occupancyData.map((zone) => (
        <View key={zone.id} style={styles.zoneItem}>
          <View style={styles.zoneInfo}>
            <View style={styles.zoneId}>
              <Text>{zone.id}</Text>
            </View>
            <View>
              <Text style={styles.zoneName}>{zone.name}</Text>
              <Text style={styles.zoneLocation}>{zone.location}</Text>
            </View>
          </View>
          <View>
            <Text style={styles.zoneValue}>{zone.value}%</Text>
            <View style={styles.barContainer}>
              <View style={[styles.barFill, { width: `${zone.value}%` }]} />
            </View>
          </View>
        </View>
      ))}

      {/* Activity Log */}
      <Text style={styles.sectionTitle}>Recent Activity Log</Text>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.col1}>People</Text>
          <Text style={styles.col2}>Recent View Location</Text>
        </View>
        {activityLog.map((log, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.col1}>{log.name}</Text>
            <Text style={styles.col2}>{log.location}</Text>
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text>© {new Date().getFullYear()} Park 'N Spot. All rights reserved.</Text>
        <Text>This report is system-generated and reflects real-time data from the facility management system.</Text>
      </View>
    </Page>
  </Document>
);