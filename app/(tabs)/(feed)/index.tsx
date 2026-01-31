
import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Stack, useRouter } from 'expo-router';
import { useApp } from '@/contexts/AppContext';
import { mockOpportunities } from '@/mocks/opportunities';
import OpportunityCard from '@/components/OpportunityCard';
import SportSwitcher from '@/components/SportSwitcher';
import { CalculatedOpportunity, Opportunity } from '@/types';
import Colors from '@/constants/colors';

export default function FeedScreen() {
  const { activeSport } = useApp();
  const router = useRouter();

  const filteredOpportunities = useMemo(() => {
    return mockOpportunities.filter(opp => opp.sport === activeSport);
  }, [activeSport]);

  const handlePressOpportunity = (calculated: CalculatedOpportunity) => {
    // Navigate to a detail screen (to be implemented)
    // We pass the serialized opportunity object as a query parameter
    router.push({
      pathname: `/opportunity/${calculated.opportunity.id}`,
      params: { calculated: JSON.stringify(calculated) },
    });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerTitle: () => <SportSwitcher />,
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: Colors.background },
          headerShadowVisible: false,
        }}
      />

      <FlashList
        data={filteredOpportunities}
        renderItem={({ item }) => (
          <OpportunityCard 
            opportunity={item as Opportunity} 
            onPress={handlePressOpportunity} 
          />
        )}
        keyExtractor={(item) => item.id}
        estimatedItemSize={250}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No opportunities available for {activeSport}.</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    paddingTop: 12,
    paddingBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
});
