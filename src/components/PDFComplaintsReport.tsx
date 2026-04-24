import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

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
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 8,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 9,
    color: '#544340',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3e0502',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1b1c19',
    marginBottom: 10,
    marginTop: 15,
  },
  table: {
    marginTop: 5,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#eae8e3',
    padding: 8,
    fontSize: 8,
    fontWeight: 'bold',
    color: '#544340',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e2dd',
    fontSize: 8,
  },
  colId: {
    flex: 0.5,
  },
  colTitle: {
    flex: 2,
  },
  colReporter: {
    flex: 1.2,
  },
  colLocation: {
    flex: 1,
  },
  colStatus: {
    flex: 0.8,
  },
  statusPending: {
    color: '#ba1a1a',
  },
  statusInProgress: {
    color: '#735a39',
  },
  statusResolved: {
    color: '#2e7d32',
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
});

interface PDFComplaintsReportProps {
  complaints: any[];
  stats: any;
  generatedAt: string;
}

export const PDFComplaintsReport: React.FC<PDFComplaintsReportProps> = ({ complaints, stats, generatedAt }) => {
  const pendingCount = complaints.filter(c => c.status === 'PENDING').length;
  const inProgressCount = complaints.filter(c => c.status === 'IN_PROGRESS').length;
  const resolvedCount = complaints.filter(c => c.status === 'RESOLVED').length;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>PARK 'N SPOT</Text>
          <Text style={styles.subtitle}>Complaints & Issues Report</Text>
          <Text style={styles.dateRange}>Generated: {generatedAt}</Text>
        </View>

        {/* Stats Summary */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Total</Text>
            <Text style={styles.statValue}>{complaints.length}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Pending</Text>
            <Text style={styles.statValue}>{pendingCount}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>In Progress</Text>
            <Text style={styles.statValue}>{inProgressCount}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Resolved</Text>
            <Text style={styles.statValue}>{resolvedCount}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Avg Response</Text>
            <Text style={styles.statValue}>{stats?.avgResponse || "1.4h"}</Text>
          </View>
        </View>

        {/* Complaints Table */}
        <Text style={styles.sectionTitle}>Complaints Details</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colId}>ID</Text>
            <Text style={styles.colTitle}>Title</Text>
            <Text style={styles.colReporter}>Reporter</Text>
            <Text style={styles.colLocation}>Location</Text>
            <Text style={styles.colStatus}>Status</Text>
          </View>
          {complaints.map((complaint, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.colId}>#{complaint.id}</Text>
              <Text style={styles.colTitle}>{complaint.title}</Text>
              <Text style={styles.colReporter}>{complaint.submittedBy}</Text>
              <Text style={styles.colLocation}>{complaint.location}</Text>
              <Text style={[
                styles.colStatus,
                complaint.status === 'PENDING' && styles.statusPending,
                complaint.status === 'IN_PROGRESS' && styles.statusInProgress,
                complaint.status === 'RESOLVED' && styles.statusResolved,
              ]}>
                {complaint.status.replace('_', ' ')}
              </Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>© {new Date().getFullYear()} Park 'N Spot. All rights reserved.</Text>
          <Text>This report includes all complaints and their current resolution status.</Text>
        </View>
      </Page>
    </Document>
  );
};