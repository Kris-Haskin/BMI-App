import React from 'react';
import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import * as SQLite from "expo-sqlite";
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();
setTimeout(SplashScreen.hideAsync, 2000);

function openDatabase() {
  if (Platform.OS === "web") {
    return {
      transaction: () => {
        return {
          executeSql: () => { },
        };
      },
    };
  }

  const db = SQLite.openDatabase("db.db");
  return db;
}

const db = openDatabase();

function Items({ done: doneHeading, onPressItem }) {
  const [items, setItems] = useState(null);

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        `select id, done, bmi, height, weight, date(itemDate) as itemDate from items where done = ? order by itemDate desc;`,
        [doneHeading ? 1 : 0],
        (_, { rows: { _array } }) => setItems(_array)
      );
    });
  }, []);

  const heading = doneHeading ? "Delete Record" : "BMI History";

  if (items === null || items.length === 0) {
    return null;
  }

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionHeading}>{heading}</Text>
      {items.map(({ id, bmi, done, height, weight, itemDate }) => (
        <TouchableOpacity
          key={id}
          onPress={() => onPressItem && onPressItem(id)}
          style={{
            backgroundColor: done ? "#1c9963" : "#fff",
          }}
        >
          <Text style={{ color: done ? "#fff" : "#000" , fontSize: 20}}>{itemDate}:   {bmi}  (H: {height}, W: {weight})</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function App() {
  const [height, setHeight] = useState(null);
  const [weight, setWeight] = useState(null);
  const [bmi, setBmi] = useState(null);
  const [forceUpdate, forceUpdateId] = useForceUpdate();
  const [storedResults, setStoredResults] = useState(null);

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        "drop table items;"
      );
      tx.executeSql(
        "create table if not exists items (id integer primary key not null, done int, bmi real, height real, weight real, itemDate real);"
      );
    });
  }, []);

  const add = (height, weight) => {
    if (height === null || height === "") {
      return false;
    }
 const bmi = computeBMI ();
    db.transaction(
      (tx) => {
        tx.executeSql("insert into items (done, bmi, height, weight, itemDate) values (0, ?, ?, ?, julianday('now'))", [bmi, height, weight]);
        tx.executeSql("select * from items", [], (_, { rows }) =>
          console.log(JSON.stringify(rows))
        );
      },
      null,
      forceUpdate
    );
  };


 const computeBMI = () => {


  const bmi = ((weight / (height * height)) * 703).toFixed(1);
  ;
  setBmi(bmi);
  if (bmi < 18.5) {
    setStoredResults("(Underweight)");
  }
  else if (bmi >= 18.5 && bmi < 25) {
    setStoredResults("(Healty)");
  }
  else if (bmi >= 25 && bmi < 30) {
    setStoredResults("(Overweight)");
  }
  else {
    setStoredResults("(Underweight)");
  }
return bmi;


}

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BMI Calculator</Text>

      {Platform.OS === "web" ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={styles.heading}>
            Expo SQlite is not supported on web!
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.flexRow}>
            <TextInput
              onChangeText={(height) => setHeight(height)}
              placeholder="Height in Inches"
              style={styles.input}
              value={height}
            />

          </View>
          <View style={styles.flexRow}>
            <TextInput
              onChangeText={(weight) => setWeight(weight)}
              placeholder="Weight in Pounds"
              style={styles.input}
              value={weight}
            />

          </View>
          <TouchableOpacity onPress={() => {
            add(height, weight);
            computeBMI(height, weight);
          }}>
            <Text style={styles.button}>Compute BMI</Text>
            
            <Text style={styles.preview}>Body Mass Index is {bmi}  </Text>
            <Text style={styles.preview}> {storedResults}</Text>
          </TouchableOpacity>


          <ScrollView style={styles.listArea}>
            <Items
              key={`forceupdate-BMI History-${forceUpdateId}`}
              done={false}
              onPressItem={(id) =>
                db.transaction(
                  (tx) => {
                    tx.executeSql(`update items set done = 1 where id = ?;`, [
                      id,
                    ]);
                  },
                  null,
                  forceUpdate
                )
              }
            />


            <Items
              done
              key={`forceupdate-done-${forceUpdateId}`}
              onPressItem={(id) =>
                db.transaction(
                  (tx) => {
                    tx.executeSql(`delete from items where id = ?;`, [id]);
                  },
                  null,
                  forceUpdate
                )
              }
            />
          </ScrollView>
        </>
      )}
    </View>
  );
}

function useForceUpdate() {
  const [value, setValue] = useState(0);
  return [() => setValue(value + 1), value];
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',

  },
  title: {
    textAlign: 'center',
    backgroundColor: '#f4511e',
    fontSize: 28,
    fontWeight: 'bold',
    color: "white",
    padding: 20,
    TextHeight: 80,
    width: '100%',
  },
  button: {
    color: "white",
    textAlign: 'center',
    backgroundColor: '#34495e',
    fontSize: 24,
    padding: 10,
    borderRadius: 3,
    marginTop: 10,
    marginBottom: 25,
    width: 420,
  },
  preview: {
    textAlign: 'center',
    fontSize: 28,
    TextHeight: 80,
    color: '#333',
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  flexRow: {
    flexDirection: "row",
  },
  input: {
    backgroundColor: '#ecf0f1',
    borderRadius: 3,
    width: 400,
    TextHeight: 40,
    padding: 5,
    margin: 5,
    fontSize: 24,
    flex: 1,
  },
  listArea: {
    width:'100%',
    paddingTop: 16,
    MarginTop:20,
  },
  sectionContainer: {
    marginBottom: 16,
    marginHorizontal: 16,
  },
  sectionHeading: {
    fontSize: 24,
    marginBottom: 8,
  },
});
// const heightKey = '@MyApp:heightKey';
// const bmiKey = '@MyApp:bmiKey'

// export default class App extends Component {
//   state = {
//     storedResults: '',
//     height: 0,
//     weight: 0,
//     bmi: '',
//   };
//   /////////////////////////////////////////////////////////////
//   constructor(props) {
//     super(props);
//     this.onLoad();
//   }
//   //componentWillUnmount() {this.onLoad};

//   onLoad = async () => {
//     try {
//       const height = await AsyncStorage.getItem(heightKey);
//       const bmi = await AsyncStorage.getItem(bmiKey);
//       this.setState({ height });
//       this.setState({ bmi });

//     } catch (error) {
//       Alert.alert('Error', 'There was an error while loading the data');
//     }
//   }

//   onSave = async () => {
//     const { height } = this.state;

//     try {
//       await AsyncStorage.setItem(heightKey, this.state.height);
//       await AsyncStorage.setItem(bmiKey, this.state.bmi);
//     } catch (error) {
//       Alert.alert('Error', 'There was an error while saving the data');
//     }

//   }

//   onChange = (height) => {
//     this.setState({ height });
//   }
//   //

//   ///////////////////////////////////////////////////////////////////////////////////////////////////
//   computeBMI = () => {
//     this.onSave();
//     //this.onChange;
//     const { height, weight } = this.state;

//     const BMI = (((weight / (height * height)) * 703).toFixed(1));
//     if (BMI < 18.5) {
//       const storedResults = "(Underweight)";
//       this.setState({ storedResults });
//     }
//     else if (BMI >= 18.5 && BMI < 25) {
//       const storedResults = "(Healthy)";
//       this.setState({ storedResults });
//     }
//     else if (BMI >= 25 && BMI < 30) {
//       const storedResults = "(Overweight)";
//       this.setState({ storedResults });
//     }
//     else {
//       const storedResults = "(Obese)";
//       this.setState({ storedResults });
//     }


//     const bmi = 'Body Mass Index is ' + BMI.toString();
//     this.setState({ bmi });



//   }






//   render() {
//     const { storedResults, height, weight, bmi } = this.state;
//     //  const {TextHeight } = this.state;
//     // const {weight} = this.state;
//     // const {bmi} = this.state;
//     // const {storedResults} = this.state;

//     return (
//       <SafeAreaView style={styles.container}>
//         <Text style={styles.title}>BMI Calculator</Text>
//         <ScrollView style={styles.scrollView}>
//           <TextInput
//             style={styles.input}
//             onChangeText={(weight) => { this.setState({ weight }) }}
//             value={weight}
//             placeholder="Weight in Pounds"
//           />
//           <TextInput
//             style={styles.input}
//             onChangeText={this.onChange}
//             //onChangeText={ (TextHeight) => {this.setState({TextHeight})}}

//             defaultValue={height}
//             value={height}
//             placeholder="Height in Inches"
//           />
//           <TouchableOpacity onPress={this.computeBMI}>
//             <Text style={styles.button}>Compute BMI</Text>
//           </TouchableOpacity>

//           <Text style={styles.preview}>{bmi}</Text>
//           <Text style={styles.preview}>{storedResults}</Text>

//           <Text style={styles.assessment}>Assessing Your BMI</Text>
//           <Text style={styles.assessment}>   Underweight: less than 18.5</Text>
//           <Text style={styles.assessment}>   Healty: 18.5 to 24.9</Text>
//           <Text style={styles.assessment}>   Overweight: 25.0 to 29.9</Text>
//           <Text style={styles.assessment}>   Obese: 30.0 or higher</Text>

//         </ScrollView>
//       </SafeAreaView>
//     );
//   }
// }



// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//   },
//   assessment: {
//     fontSize: 20,
//   },
//   preview: {
//     textAlign: 'center',
//     fontSize: 28,
//     TextHeight: 80,
//     color: '#333',
//     //marginBottom: 5,
//     // marginTop: 15, 
//   },
//   title: {
//     textAlign: 'center',
//     backgroundColor: '#f4511e',
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: "white",
//     padding: 20,
//     TextHeight: 80,
//     width: 400,
//   },
//   input: {
//     backgroundColor: '#ecf0f1',
//     borderRadius: 3,
//     width: 350,
//     TextHeight: 40,
//     padding: 5,
//     margin: 5,
//     fontSize: 24,
//   },
//   button: {
//     color: "white",
//     textAlign: 'center',
//     backgroundColor: '#34495e',
//     fontSize: 24,
//     padding: 10,
//     borderRadius: 3,
//     marginTop: 10,
//     marginBottom: 25,
//   },
// });

