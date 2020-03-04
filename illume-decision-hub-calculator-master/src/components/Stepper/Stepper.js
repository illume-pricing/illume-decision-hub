import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import './Stepper.css';
import Nav from '../Nav/Nav';

export default function Stepper() {
  // Using hooks to access redux and saga
  const dispatch = useCallback(useDispatch(), []);
  const inputData = useSelector(state => state.input);
  const questionData = useSelector(state => state.question);
  const splitData = useSelector(state => state.split);
  const lastPageID = useSelector(state => state.previousQuestion);
  const history = useHistory();
  const user = useSelector(state => state.userInfo);
  const [input, setInput] = useState(inputData[questionData.question_id] || '');
  const [splitNext, setSplitNext] = useState('');

  // imports previous user inputs
  useEffect(() => {
    setInput(inputData[questionData.question_id] || '');
  }, [inputData, questionData.question_id]);

  // Gives radio button selection a default value
  useEffect(() => {
    const split = splitData[0] && splitData[0].next_id;
    const input = splitData[0] && splitData[0].next_id;
    if (questionData.split) {
      setSplitNext(split || '');
      setInput(input || '');
    }
  }, [questionData.split, inputData, questionData.question_id, splitData]);

  // Replaces the text of product with service if a service industry has been selected
  useEffect(()=>{
    if(questionData && questionData.skipToResults){
      const url = questionData.calculator.replace(/ /g, '-').toLowerCase();
      delete questionData.skipToResults;
      dispatch({ type: `SET_QUESTION`, payload: questionData });
      history.push(`/${url}`);
    }
  }, [questionData, history, dispatch]);

  // Add class if input has a value, removes the class if input has no value
  const checkForValue = e => e.target.value ? e.target.classList.add('text-field-active') : e.target.classList.remove('text-field-active');

  // Set local state for input
  const handleChange = e => {
    if(questionData.question2){
      let holder = {...input}
      holder[e.target.name] = e.target.value;
      setInput(holder)
    } else {
      setInput(e.target.value);
    }
    checkForValue(e);
  }

  // Push to next question
  function nextPage() {
    dispatch({ type: 'ADD_PREVIOUS_QUESTION', payload: questionData.id });
    dispatch({ type: 'ADD_INPUT_VALUE', payload: { key: questionData.question_id, value: input } });
    setInput('');
    // A null ends the calculator and sends you to the results page.
    // Make sure the results page url is the calculator name in the DB with '-'
    // instead of spaces
    if (questionData.next_id == null) {
      const url = questionData.calculator.replace(/ /g, '-').toLowerCase();
      history.push(`/${url}`);
    } else if (questionData.split) {
      dispatch({ type: 'GET_QUESTION', payload: { query: { id: splitNext } } });
    } else {
      dispatch({ type: 'GET_QUESTION', payload: { query: { id: questionData.next_id } } });
    }
  }

  // Push to previous question
  function lastPage() {
    if (lastPageID.length === 0) {
      history.push('/');
    } else {
      dispatch({ type: 'GET_QUESTION', payload: { query: { id: lastPageID.pop() } } });
      let holder = lastPageID; // used because lastPageID is modified on the previous line
      dispatch({ type: 'NEXT_PREVIOUS_QUESTION', payload: holder });
    }
  }

  // Handles pressing enter
  function submit(e) {
    e.preventDefault();
    nextPage();
  }

  return (
    <center>
      <Nav />
      <div className='main-container stepper-container'>
        <div className="stepper-max-width-container">
          <div className="top-card-container">
            <form onSubmit={e=>{submit(e)}}>
              <div>
                <p className="question-text">
                  {
                    user[0] && user[0].service && questionData.question ? 
                      questionData.question.replace(/product/g, 'service')
                      : 
                      questionData.question
                  }
                </p>
                <br />
                {questionData.split ?
                  <div>
                    <div className="radio-wrapper">
                      {splitData.map(split => {
                        return (
                          <span key={split.id}>
                            <label className="radio-container">
                              {
                                user[0] && user[0].service && split.split_text?
                                split.split_text.replace(/Product/g, 'Service')
                                :
                                split.split_text
                              }
                              <input
                                type="radio"
                                name="next"
                                value={split.next_id}
                                checked={+splitNext === split.next_id}
                                onChange={(e) => { setSplitNext(split.next_id); setInput(e.target.value); }}
                              />
                              <span className="radio-btn"></span>
                            </label>
                          </span>
                        );
                      })}
                    </div>
                    <span className="tooltip-background tooltip-background-radio">
                      <span className="tooltip-icon">?</span>
                      <span className="tooltip-text">{questionData.help_text}</span>
                    </span>
                  </div>
                  :
                  <>
                    <center>
                      <div className="text-field-container" key={questionData.question_id}>
                        <input 
                          className="text-field"
                          value={questionData.question2? input[questionData.header]: input} 
                          name={questionData.header}
                          onChange={(e)=>handleChange(e)} 
                          type={questionData.response_type} 
                          autoFocus
                        />
                        <label className="text-field-label">enter value</label>
                        <div className="text-field-mask stepper-mask"></div>
                        <span className="tooltip-background tooltip-background-textfield">
                          <span className="tooltip-icon">?</span>
                          <span className="tooltip-text">{questionData.help_text}</span>
                        </span>
                      </div>
                    </center>
                    {
                      questionData.question2? 
                        <>
                          <p className="question-text">
                          {
                            user[0] && user[0].service && questionData.question2? 
                              questionData.question2.replace(/product/g, 'service'): 
                              questionData.question2
                          }
                          </p>
                          <center>
                            <div className="text-field-container" key={questionData.question_id}>
                              <input 
                                className="text-field"
                                value={input[questionData.header + '2']} 
                                name={questionData.header + '2'}
                                onChange={(e)=>handleChange(e)} 
                                type={questionData.response_type2} 
                                autoFocus
                              />
                              <label className="text-field-label">enter value</label>
                              <div className="text-field-mask stepper-mask"></div>
                              <span className="tooltip-background tooltip-background-textfield">
                                <span className="tooltip-icon">?</span>
                                <span className="tooltip-text">{questionData.help_text2}</span>
                              </span>
                            </div>
                          </center>
                        </>:
                        null
                    }
                  </>
                }
              </div>
            </form>
          </div>
        </div>
        {lastPageID.length > 0 ? <div onClick={lastPage} className='arrow-left' /> : null}
        <div onClick={nextPage} className='arrow-right' />
      </div>
    </center>
  );
}