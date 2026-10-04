// Inside OnboardingScreen's handleFinishOnboarding function
import AsyncStorage from '@react-native-async-storage/async-storage';


export const handleFinishOnboarding = async () => {
  await AsyncStorage.setItem('onboarding_complete', 'true');

};