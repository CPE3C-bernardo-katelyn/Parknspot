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
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 8,
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: '#544340',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3e0502',
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
    fontSize: 9,
  },
  colName: {
    flex: 2,
  },
  colEmail: {
    flex: 3,
  },
  colStatus: {
    flex: 1,
  },
  colActivity: {
    flex: 1.5,
  },
  statusActive: {
    color: '#2e7d32',
    backgroundColor: '#e8f5e9',
    padding: '2 6',
    borderRadius: 4,
    fontSize: 8,
    fontWeight: 'bold',
  },
  statusInactive: {
    color: '#757575',
    backgroundColor: '#eeeeee',
    padding: '2 6',
    borderRadius: 4,
    fontSize: 8,
    fontWeight: 'bold',
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

interface PDFUserReportProps {
  users: any[];
  generatedAt: string;
}

export const PDFUserReport: React.FC<PDFUserReportProps> = ({ users, generatedAt }) => {
  const activeUsers = users.filter(u => u.status === 'ACTIVE').length;
  const inactiveUsers = users.filter(u => u.status === 'INACTIVE').length;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>PARK 'N SPOT</Text>
          <Text style={styles.subtitle}>User Access Registry</Text>
          <Text style={styles.dateRange}>Generated: {generatedAt}</Text>
        </View>

        {/* Stats Summary */}
        <View style={styles.stats}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Total Users</Text>
            <Text style={styles.statValue}>{users.length}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Active</Text>
            <Text style={styles.statValue}>{activeUsers}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Inactive</Text>
            <Text style={styles.statValue}>{inactiveUsers}</Text>
          </View>
        </View>

        {/* Users Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colName}>Name</Text>
            <Text style={styles.colEmail}>Email</Text>
            <Text style={styles.colStatus}>Status</Text>
            <Text style={styles.colActivity}>Last Activity</Text>
          </View>
          {users.map((user, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.colName}>{user.name}</Text>
              <Text style={styles.colEmail}>{user.email}</Text>
              <Text style={styles.colStatus}>
                {user.status}
              </Text>
              <Text style={styles.colActivity}>{user.lastActivity || 'Just now'}</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>© {new Date().getFullYear()} Park 'N Spot. All rights reserved.</Text>
          <Text>This report includes all registered users in the system.</Text>
        </View>
      </Page>
    </Document>
  );
};