import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Alert, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Fontisto } from '@expo/vector-icons';
import BouncyCheckbox from 'react-native-bouncy-checkbox';

import { theme } from './colors';

const STORAGE_KEY = '@toDos';

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState('');
  const [toDos, setToDos] = useState({});
  const [modalVisible, setModalVisible] = useState('');
  const [newText, setNewText] = useState('');

  useEffect(() => {
    loadToDos();
    setWorking(working);
  }, []);

  const travel = () => setWorking(false);
  const work = () => setWorking(true);
  const onChangeText = (payload) => setText(payload);
  const saveToDos = async (toSave) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  };
  const loadToDos = async () => {
    const s = await AsyncStorage.getItem(STORAGE_KEY);
    setToDos(JSON.parse(s));
  };
  const addTodo = async () => {
    if (text === '') {
      return;
    }

    const newToDos = { ...toDos, [Date.now()]: { text, working, completed: false } };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText('');
  };

  const deleteToDos = (key) => {
    Alert.alert('Delete To Do', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: "I'm Sure",
        style: 'destructive',
        onPress: () => {
          const newToDos = { ...toDos };
          delete newToDos[key];

          setToDos(newToDos);
          saveToDos(newToDos);
        },
      },
    ]);
  };

  const checked = (key) => {
    const newToDos = { ...toDos };
    if (!newToDos[key].completed) {
      newToDos[key].completed = true;
    } else {
      newToDos[key].completed = false;
    }

    setToDos(newToDos);
    saveToDos(newToDos);
  };

  const changedTitle = async (key) => {
    if (newText === '') {
      return;
    }

    const newToDos = { ...toDos };
    console.log(newToDos);
    console.log(key);
    newToDos[key].text = newText;

    setToDos(newToDos);
    await saveToDos(newToDos);
    setNewText('');
  };

  const onChangeNewText = (payload) => setNewText(payload);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text style={{ ...styles.btnText, color: working ? 'white' : theme.grey }}>Work</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={travel}>
          <Text style={{ ...styles.btnText, color: !working ? 'white' : theme.grey }}>Travel</Text>
        </TouchableOpacity>
      </View>

      <View>
        <TextInput onSubmitEditing={addTodo} style={styles.input} value={text} placeholder={working ? 'Add a TO DO' : 'Where do you wanna go?'} onChangeText={onChangeText} returnKeyType="done" />
      </View>

      <ScrollView>
        {Object.keys(toDos)
          .sort((a, b) => b - a)
          .map((key) =>
            toDos[key].working === working ? (
              <View key={key} style={styles.toDo}>
                <Modal
                  animationType="slide"
                  transparent={true}
                  visible={modalVisible !== ''}
                  onRequestClose={() => {
                    Alert.alert('Modal has been closed.');
                    setModalVisible('');
                  }}
                >
                  <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                      <View>
                        <Text>Change your Title</Text>
                        <TextInput value={newText} placeholder="Enter your new title here" style={{ ...styles.input, minWidth: '75%', maxWidth: '75%' }} onChangeText={onChangeNewText} />
                      </View>

                      <TouchableOpacity
                        onPress={() => {
                          changedTitle(modalVisible);
                          setModalVisible('');
                        }}
                      >
                        <Text style={{ color: 'white' }}>Confirm</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>

                <View style={styles.toDoMain}>
                  <BouncyCheckbox style={{ paddingHorizontal: 5 }} onPress={() => checked(key)} isChecked={toDos[key].completed} />

                  <TouchableOpacity onPress={() => setModalVisible(key)} style={{ flex: 3 }}>
                    <Text style={{ ...styles.toDoText, textDecorationLine: toDos[key].completed ? 'line-through' : 'none' }}>{toDos[key].text}</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => deleteToDos(key)}>
                  <Fontisto name="trash" size={18} color={theme.grey} />
                </TouchableOpacity>
              </View>
            ) : null
          )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: '600',
  },
  input: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 14,
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  toDoText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  toDoMain: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 4,
  },
  modalView: {
    margin: 20,
    backgroundColor: theme.grey,
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  centeredView: {
    flex: 1,
    alignItems: 'center',
    marginTop: 50,
  },
});
