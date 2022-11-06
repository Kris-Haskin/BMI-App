import React, { Component } from 'react';
import {
  Alert,

  SafeAreaView,

  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
 ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';

const key = '@MyApp:key';

export default class App extends Component {
  state = {
    storedValue: 0,
    height: 0,
    weight: 0,
    bmi: '',
  };

  constructor(props) {
    super(props);
    this.onLoad();
  }

  onLoad = async () => {
    try {
      const storedValue = await AsyncStorage.getItem(key);
      this.setState({ storedValue });
    } catch (error) {
      Alert.alert('Error', 'There was an error while loading the data');
    }
  }

  onSave = async () => {
    const { height } = this.state;

    try {
      await AsyncStorage.setItem(key, height.toString());
    } catch (error) {
      Alert.alert('Error', 'There was an error while saving the data');
    }
  }

  onChange = (height) => {
    this.setState({ height });
  }

  computeBMI = () => {
    const { storedValue, weight} = this.state;
    const bmi = "Body Mass Index is " + (((weight / (storedValue * storedValue)) * 703).toFixed(1)).toString();
    this.setState({bmi})
  }

  render() {
     const {height } = this.state;
    const {weight} = this.state;
    const {bmi} = this.state;
    const {storedValue} = this.state;

    return (
      <SafeAreaView style={styles.container}>
<Text style = {styles.title}>BMI Calculator</Text>
        <ScrollView style={styles.scrollView}>
          <TextInput
            style={styles.input}
            onChangeText={ (weight) => {this.setState({weight})}}
            value={weight}
            placeholder="Weight in Pounds"
          />
           <TextInput
            style={styles.input}
            onChangeText={this.onChange}
            defaultValue= {storedValue}
            value= {height}
            placeholder="Height in Inches"
          />
            <TouchableOpacity onPress={this.computeBMI}>
            <Text style={styles.button}>Compute BMI</Text>
          </TouchableOpacity>

                  <Text style={styles.preview}>{bmi}</Text>

                  <Text style={styles.assessment}>Assessing Your BMI</Text>
                  <Text style={styles.assessment}>   Underweight: less than 18.5</Text>
                  <Text style={styles.assessment}>   Healty: 18.5 to 24.9</Text>
                  <Text style={styles.assessment}>   Overweight: 25.0 to 29.9</Text>
                  <Text style={styles.assessment}>   Obese: 30.0 or higher</Text>
                  
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',    
  },
assessment: {
  fontSize: 20,
},
  preview: {
 textAlign: 'center',
    fontSize: 28,
    height: 80,
    color: '#333',
    marginBottom: 40,
    marginTop: 40, 
  },
  title: {
    textAlign: 'center',
    backgroundColor: '#f4511e',
    fontSize: 28,
    fontWeight: 'bold',
    color: "white",
    padding:20,
    height: 80,
    width: 480,
  },
  input: {
    backgroundColor: '#ecf0f1',
    borderRadius: 3,
    width: 350,
    height: 40,
    padding: 5,
    marginTop:10,
    fontSize: 24,
  },
  button: {
    color: "white",
    textAlign: 'center',
    backgroundColor: '#34495e',
    fontSize: 24,
    padding: 10,
    borderRadius: 3,
    marginTop: 10,
  },
});

