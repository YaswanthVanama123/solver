import React from 'react';
import { View, Text, Button, FlatList } from 'react-native';
import { useNavigationHistory } from './NavigationHistoryContext'; // Adjust import path

const NavigationHistoryScreen = ({ navigation }) => {
  const { history } = useNavigationHistory();

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text>Navigation History</Text>
      <FlatList
        data={history}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={{ marginVertical: 10 }}>
            <Text>Screen: {item.screenName}</Text>
            <Button
              title="Go to Screen"
              onPress={() => navigation.navigate(item.screenName, item.params)}
            />
          </View>
        )}
      />
    </View>
  );
};

export default NavigationHistoryScreen;
