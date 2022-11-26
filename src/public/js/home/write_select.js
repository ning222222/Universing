let select_box = [{ id: 1, title: 'select', name: '장르선택', description: 'genre' },
{ id: 2, title: 'pop', name: '팝', description: 'genre' },
{ id: 3, title: 'metal', name: '메탈', description: 'genre' },
{ id: 4, title: 'disco', name: '디스코', description: 'genre' },
{ id: 5, title: 'blues', name: '블루스', description: 'genre' },
{ id: 6, title: 'ballade', name: '발라드', description: 'genre' },
{ id: 7, title: 'reggae', name: '레게', description: 'genre' },
{ id: 8, title: 'classical', name: '클래식', description: 'genre' },
{ id: 9, title: 'rock', name: '락', description: 'genre' },
{ id: 10, title: 'hiphop', name: '힙합', description: 'genre' },
{ id: 11, title: 'country', name: '컨트리', description: 'genre' },
{ id: 11, title: 'jazz', name: '재즈', description: 'genre' }
];

let tag = '<select>\n';
for(let i=0; i<select_box.length; i++){
	tag += `    <option value=${select_box[i].id}>${select_box[i].name}</option>\n`;
}
tag += '</select>';

document.querySelector('#jsselect').innerHTML = tag;