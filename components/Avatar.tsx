import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { colors } from '@/constants/Colors';
import { getInitials } from '@/utils/helpers';

interface AvatarProps {
  firstName: string;
  lastName: string;
  imageUrl?: string;
  size?: number;
  backgroundColor?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  firstName,
  lastName,
  imageUrl,
  size = 40,
  backgroundColor = colors.primary,
}) => {
  const initials = getInitials(firstName, lastName);
  
  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor,
  };
  
  const textStyle = {
    fontSize: size * 0.4,
  };
  
  return (
    <View style={[styles.container, containerStyle]}>
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
        />
      ) : (
        <Text style={[styles.text, textStyle]}>{initials}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: colors.white,
    fontWeight: 'bold',
  },
  image: {
    resizeMode: 'cover',
  },
});