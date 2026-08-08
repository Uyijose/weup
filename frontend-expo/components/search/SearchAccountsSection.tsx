import React from "react";
import { Text, View } from "react-native";
import SearchAccountCard from "./SearchAccountCard";
import { searchAccountsSectionStyles } from "../../styles/search/searchAccountsSection.styles";

export type SearchAccount = {
  id: string;
  creator_username: string | null;
  creator_avatar_url: string | null;
};

type SearchAccountsSectionProps = {
  users: SearchAccount[];
};

export default function SearchAccountsSection({
  users,
}: SearchAccountsSectionProps) {
  return (
    <View style={searchAccountsSectionStyles.container}>
      <Text style={searchAccountsSectionStyles.title}>
        Accounts
      </Text>

      {users.length === 0 ? (
        <Text style={searchAccountsSectionStyles.emptyText}>
          No accounts found
        </Text>
      ) : (
        <View>
          {users.map((user) => (
            <SearchAccountCard
              key={user.id}
              user={user}
            />
          ))}
        </View>
      )}
    </View>
  );
}