import React, {useEffect, useState} from "react";
import MultiRootEditor from '@ckeditor/ckeditor5-build-multi-root';
import { useMultiRootEditor } from '@ckeditor/ckeditor5-react';

const multiRootEditoroption1 = {
	question: '<h2>Sample</h2>',
	option1: '<p>It is the custom option1</p',
	option2: '<p>You can use this sample to validate whether your</p'
};

const SAMPLE_READ_ONLY_LOCK_ID = 'Integration Sample';

const rootsAttributes = {
	question: {
		row: '1',
		order: 10
	},
	option1: {
		row: '1',
		order: 20
	},
	option2: {
		row: '2',
		order: 10
	}
};


function MultiRootCustom () {

    const editorProps = {
		editor: MultiRootEditor,
		data: multiRootEditoroption1,
		rootsAttributes: rootsAttributes,

		config: {
			toolbar: [ 'bold', 'italic', 'insertTable'],
			table: {
				contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ]
			},
			rootsAttributes: rootsAttributes
		}
	};

	const {
		editor, editableElements, toolbarElement,
		data, setData,
		attributes, setAttributes
	} = useMultiRootEditor( editorProps );

	useEffect(()=>{
		console.log(data);
	}, [data])

	// The <select> element state, used to pick the root to remove.
	// This is for demo purposes, and you may remove it in the actual integration or change accordingly to your needs.
	const [ selectedRoot, setSelectedRoot ] = useState();

	// The <input> element state with number of roots that should be added in one row.
	// This is for demo purposes, and you may remove it in the actual integration or change accordingly to your needs.
	const [ numberOfRoots, setNumberOfRoots ] = useState( 1 );

	// A set with disabled roots. It is used to support read-only feature in multi root editor.
	// This is for demo purposes, and you may remove it in the actual integration or change accordingly to your needs.
	const [ disabledRoots, setDisabledRoots ] = useState( new Set() );

	// Function to toggle read-only mode for selected root.
	const toggleReadOnly = () => {
		const root = editor?.model.document.selection.getFirstRange()?.root;

		if ( !root || !root.rootName ) {
			return;
		}

		const isReadOnly = disabledRoots.has( root.rootName );

		if ( isReadOnly ) {
			disabledRoots.delete( root.rootName );
			editor?.enableRoot( root.rootName, SAMPLE_READ_ONLY_LOCK_ID );
		} else {
			disabledRoots.add( root.rootName );
			editor?.disableRoot( root.rootName, SAMPLE_READ_ONLY_LOCK_ID );
		}

		setDisabledRoots( new Set( disabledRoots ) );
	};

	const addRoot = ( newRootAttributes, rootId ) => {
		const id = rootId || new Date().getTime();

		for ( let i = 1; i <= numberOfRoots; i++ ) {
			const rootName = `root-${ i }-${ id }`;

			data[ rootName ] = '';

			// Remove code related to rows if you don't need to handle multiple roots in one row.
			attributes[ rootName ] = { ...newRootAttributes, order: i * 10, row: id };
		}

		setData( { ...data } );
		setAttributes( { ...attributes } );
		// Reset the <input> element to the default value.
		setNumberOfRoots( 1 );
	};

	const removeRoot = ( rootName ) => {
		setData( previousData => {
			const { [ rootName ]: _, ...newData } = previousData;

			return { ...newData };
		} );

		setSelectedRoot( '' );
	};

	// Group elements based on their row attribute and sort them by order attribute.
	// Grouping in a row is used for presentation purposes, and you may remove it in actual integration.
	// However, we recommend ordering the roots, so that rows are put in a correct places when undo/redo is used.
	const groupedElements = Object.entries(
		editableElements
			.sort( ( a, b ) => ( attributes[ a.props.id ].order ) - ( attributes[ b.props.id ].order ) )
			.reduce( ( acc, element ) => {
				const row = attributes[ element.props.id ].row;
				acc[ row ] = acc[ row ] || [];
				acc[ row ].push( element );

				return acc;
			}, {} )
	);

	return (
		<>
			<div className="buttons">
				<button
					onClick={ toggleReadOnly }
					disabled={ !editor || !Object.keys( data ).length }
				>
					Toggle read-only mode
				</button>

			</div>

			<div className="buttons">
				<button
					onClick={ () => removeRoot( selectedRoot ) }
					disabled={ !selectedRoot }
				>
					Remove root
				</button>

				<select value={ selectedRoot || 'placeholder'} onChange={ ( evt ) => {
					setSelectedRoot( evt.target.value );
				}}>
					<option hidden value="placeholder">Select root to remove</option>

					{ Object.keys( data ).map( rootName => (
						<option key={ rootName } value={ rootName }>{ rootName }</option>
					) ) }
				</select>
			</div>

			<div className="buttons">
				<button
					onClick={ () => addRoot( { row: 'section-1' } ) }
				>
					Add row with roots
				</button>

				<input
					type="number"
					min="1"
					max="4"
					value={ numberOfRoots }
					onChange={e => Number( e.target.value ) <= 4 && setNumberOfRoots( Number( e.target.value ) )}
				/>
			</div>

			<br />

			{ toolbarElement }

			{ /* Maps through `groupedElements` array to render rows that contains the editor roots. */ }
			{ groupedElements.map( ( [ row, elements ] ) => (
				<div key={row} className={`flex wrapper-row-${ row }`}>
					{ elements }
				</div>
			) ) }
		</>
	);
}

export default MultiRootCustom;
