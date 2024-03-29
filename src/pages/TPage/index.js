
import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useDispatch, useMappedState } from 'redux-react-hook'
import action from '../../actions/test'

function APage () {
	const latestMessage = useRef()
	console.log(latestMessage)
	const { count } = useMappedState((state) => ({
		count: state.test.count
	}))
	const dispatch = useDispatch()
	const add = async () => {

		dispatch({
			type: 'TEST_ADD_COUNT',
			num: 3
		})
		let res = await action.TestRQ()
		console.log(res)
	}
	const sub = () => {
		dispatch({
			type: 'TEST_SUB_COUNT',
			num: 3
		})
	}
	return (
		<div>
	    count: ======= {count}
			<button ref={latestMessage} onClick={add}> + </button>
			<button onClick={sub}> - </button>
		</div>
	)
}

export default APage
