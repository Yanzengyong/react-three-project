/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react'
import * as THREE from 'three'
import './index.scss'
import Orbitcontrols from 'three-orbitcontrols'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer'
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer'
import TWEEN from '@tweenjs/tween.js'

function FinalPage () {
	useEffect(() => {
		console.log(TWEEN)
		init()
	}, [])
	const [showFont, setShowFont] = useState(false)
	// 查看详情版面
	const checkFn = () => {
		console.log('312312312')
		setShowFont(true)
	}
	// 创建场景
	let scene = new THREE.Scene()

	// 创建透视相机
	let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000)

	// 创建渲染器
	let renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })

	// 创建向量
	let vector = new THREE.Vector3()

	// 相机镜头视野终点
	let cameraTarget = new THREE.Vector3(0, 0, 100)

	// 创建css2d渲染器
	let labelRenderer = new CSS2DRenderer()

	// 创建css3d渲染器
	let css3DRenderer = new CSS3DRenderer()

	// 为点击声明的变量 （广播 、 鼠标）
	let raycaster = new THREE.Raycaster()
	let mouse = new THREE.Vector2()

	// 文字声明 / 详情面板（为了提供动态删除的可能性）
	let model_text
	let apply_one
	let apply_two
	let apply_three
	let apply_four
	let field_info_plane
	let apply_one_text
	let apply_two_text
	let apply_three_text
	let apply_four_text

	// 可以被点击的模型对象数组
	let clickObjectArr = []

	// filed组成的模型的名称声明 （目的提供全局使用该坐标） 当前的状态
	let irregular_field = []
	let cube_field = []
	let annular_field = []
	let sphere_field = []
	let init_field = []
	let currentField = 'init'
	let group_source_array = []

	// 判断的关键字声明
	let hasSource = true

	// 创建数据源组 ----- 球形
	let group_source_sphere = new THREE.Group()
	scene.add(group_source_sphere)

	// 创建数据源组
	let group_source = new THREE.Group()
	scene.add(group_source)

	// 创建数据源filed的详情面板组
	let group_field_info = new THREE.Group()
	scene.add(group_field_info)

	// 创建数据源组 ----- 球体 --- 上方的文字
	let group_source_sphere_text = new THREE.Group()
	group_source_sphere_text.position.set(0, 800, 0)
	scene.add(group_source_sphere_text)

	// 创建加工组
	// let group_process = new THREE.Group()
	// group_process.position.set(1200, 800, -800)
	// scene.add(group_process)

	// 创建一个平面展示组
	let group_plane_news = new THREE.Group()
	group_plane_news.position.set(800, 0, 0)
	scene.add(group_plane_news)

	// 创建围绕中新球体的球体
	let group_rotate = new THREE.Group()
	scene.add(group_rotate)

	// 相机控制函数
	const animateCamera = (current, target, type, time) => {
		new TWEEN.Tween({
			x: current.x,
			y: current.y,
			z: current.z
		})
			.to({
				x: target.x,
				y: target.y,
				z: target.z
			}, time || 1000)
			.easing(type)
			.onUpdate(obj => {
				camera.position.x = obj.x
				camera.position.y = obj.y
				camera.position.z = obj.z
			}).start()
	}

	// 数据源 小方块在球体中的循环移动的效果
	const animateCubeTranslate = (current, target, type1, type2, cube) => {
		const uploadHandle = (obj) => {
			// cube.position.x = obj.x
			// cube.position.y = obj.y
			// cube.position.z = obj.z
			cube.rotation.x += Math.random() * 0.05
			cube.rotation.y += Math.random() * 0.05
			cube.rotation.z += Math.random() * 0.05
		}
		let position = current
		let translate1 = new TWEEN.Tween(position)
			.to({
				x: 200 * (2.0 * Math.random() - 1.0),
				y: 200 * (2.0 * Math.random() - 1.0),
				z: 200 * (2.0 * Math.random() - 1.0)
			}, 3600)
			.easing(type1)
			.onUpdate(obj => {
				uploadHandle(obj)
			})
		let translate2 = new TWEEN.Tween(position)
			.to(target, 3600)
			.easing(type2)
			.onUpdate(obj => {
				uploadHandle(obj)
			})
		translate1.chain(translate2)
		translate2.chain(translate1)
		translate1.start()
	}

	// 动态添加文字处理函数
	const dynamicAddText = (group, text, x, y, z, size) => {
		console.log('此刻我正在添加文字' + text)
		// 为这个模型几何加上label文案
		let labelDiv = document.createElement('div')
		labelDiv.className = size === 'small' ? 'label_small' : 'label'
		labelDiv.textContent = text
		labelDiv.style.marginTop = '-1em'
		let modelLabel = new CSS2DObject(labelDiv)
		modelLabel.position.set(x || 0, y || 0, z || 0)
		group.add(modelLabel)
		return modelLabel
	}

	// 动态清除group的2d文字
	const dynamicDeleteText = (group, labelModel) => {
		group.remove(group, labelModel)
	}

	// 这是数据源头 --- 缩小为一个点后 ---- 扩散成数据元的动画过程（使用chain会变得巨卡，待优化，暂时以settimeout方式）
	const sourceChangeField = () => {
		// setShowFont(true)
		new TWEEN.Tween({
			x: camera.position.x,
			y: camera.position.y,
			z: camera.position.z
		})
			.to({
				x: 0,
				y: 100,
				z: 1300
			}, 1500)
			.easing(TWEEN.Easing.Linear.None)
			.onUpdate(obj => {
				camera.position.x = obj.x
				camera.position.y = obj.y
				camera.position.z = obj.z
			}).start()
		let timer_lessen = setTimeout(() => {
			for (let i = 0; i < group_source_array.length; i++) {
				new TWEEN.Tween({
					x: group_source_array[i].position.x,
					y: group_source_array[i].position.y,
					z: group_source_array[i].position.z
				})
					.to({
						x: 0,
						y: 0,
						z: 0
					}, 3000)
					.easing(TWEEN.Easing.Linear.None)
					.onUpdate(obj => {
						group_source_array[i].position.x = obj.x
						group_source_array[i].position.y = obj.y
						group_source_array[i].position.z = obj.z
					}).start()
				let timer = setTimeout(() => {
					group_source.remove(group_source_array[i])
					// TWEEN.removeAll()
					// 清除其他求的标题文字
					// dynamicDeleteText(group_rotate, apply_one_text)
					// dynamicDeleteText(group_rotate, apply_two_text)
					// dynamicDeleteText(group_rotate, apply_three_text)
					// dynamicDeleteText(group_rotate, apply_four_text)
					hasSource = false
					clearTimeout(timer)
				}, 4000)
			}
			clearTimeout(timer_lessen)
		}, 2000)
		let timer_field = setTimeout(() => {
			for (let i = 0; i < init_field.length; i++) {
				group_source.add(init_field[i])
				new TWEEN.Tween({
					x: 0,
					y: 0,
					z: 0
				})
					.to({
						x: init_field[i].position.x,
						y: init_field[i].position.y,
						z: init_field[i].position.z
					}, 3000)
					.easing(TWEEN.Easing.Linear.None)
					.onUpdate(obj => {
						init_field[i].position.x = obj.x
						init_field[i].position.y = obj.y
						init_field[i].position.z = obj.z
					}).start()
			}
			clearTimeout(timer_field)
		}, 6000)

	}

	// 合并这些矩形几何体
	const showPlaneFn = () => {
		sourceChangeField()
	}

	// 切回到观察中心圆球的视角
	const backSourceFn = () => {
		animateCamera({
			x: 0,
			y: 0,
			z: 0
		}, {
			x: 0,
			y: 100,
			z: 1300
		}, TWEEN.Easing.Quadratic.Out)
		cameraTarget = new THREE.Vector3(0, 0, 100)
		group_field_info.remove(field_info_plane)
	}

	// 切换视角
	const clickFn = () => {
		animateCamera({
			x: 0,
			y: 0,
			z: 0
		}, {
			x: 1200,
			y: 800,
			z: 600
		}, TWEEN.Easing.Circular.InOut, 1200)
		cameraTarget = new THREE.Vector3(1200, 700, 100)
		// model_text = dynamicAddText(group_process, '我可以加工数据', 0, 68, 0)
	}

	// 切换会最初状态
	const resetFn = () => {
		animateCamera({
			x: 0,
			y: 0,
			z: 0
		}, {
			x: 0,
			y: 600,
			z: 2400
		}, TWEEN.Easing.Quadratic.Out)
		cameraTarget = new THREE.Vector3(0, 0, 100)
		group_field_info.remove(field_info_plane)
	}

	// 查看详情版面
	// const checkFn = () => {
	// 	animateCamera({
	// 		x: 0,
	// 		y: 0,
	// 		z: 0
	// 	}, {
	// 		x: 1600,
	// 		y: 0,
	// 		z: 700
	// 	}, TWEEN.Easing.Circular.InOut, 1200)
	// 	cameraTarget = new THREE.Vector3(1600, 0, 0)
	// }

	// 切换字段组成形状效果的 --------  过渡效果函数
	const filedChangeTransform = (targets, duration) => {
		for (let i = 0; i < 300; i ++) {
			let object = init_field[i]
			let target = targets[i]
			new TWEEN.Tween(object.position)
				.to({ x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration)
				.easing(TWEEN.Easing.Exponential.InOut)
				.start()
			new TWEEN.Tween(object.rotation)
				.to({ x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration)
				.easing(TWEEN.Easing.Exponential.InOut)
				.start()
		}
	}

	// 切换字段效果的组成形状的 处理函数
	const filedGeometryChangeFn = (name) => {
		currentField = name
		TWEEN.removeAll()
		if (name === 'Sphere') {
			filedChangeTransform(sphere_field, 2000)
		} else if (name === 'Cube') {
			filedChangeTransform(cube_field, 2000)
		} else if (name === 'Annular') {
			filedChangeTransform(annular_field, 2000)
		} else {
			filedChangeTransform(irregular_field, 2000)
		}
	}

	// 查看生成详情的字段信息 --- 点击
	const fieldInfoFn = () => {
		filedChangeTransform(sphere_field, 1000)
		animateCamera(camera.position, {
			x: 0,
			y: 0,
			z: 500
		}, TWEEN.Easing.Circular.InOut, 2400)
		let timer = setTimeout(() => {
			let souceDiv = document.createElement('div')
			souceDiv.className = 'element_big'
			souceDiv.style.backgroundColor = 'rgb(6, 90, 245)'
			let symbol = document.createElement('div')
			symbol.className = 'symbol_big'
			symbol.textContent = '字段名称：Name'
			souceDiv.appendChild(symbol)
			let nameDiv = document.createElement('div')
			nameDiv.className = 'symbol_big'
			nameDiv.textContent = '中文名称：姓名'
			souceDiv.appendChild(nameDiv)
			let modelDiv = document.createElement('div')
			modelDiv.className = 'symbol_big'
			modelDiv.textContent = '所属模型：暂无'
			souceDiv.appendChild(modelDiv)
			let rangeDiv = document.createElement('div')
			rangeDiv.className = 'symbol_big'
			rangeDiv.textContent = '值域：1 -- 4'
			souceDiv.appendChild(rangeDiv)
			let bornDiv = document.createElement('div')
			bornDiv.className = 'symbol_big'
			bornDiv.textContent = '来源方式：自动生成'
			souceDiv.appendChild(bornDiv)
			let descDiv = document.createElement('div')
			descDiv.className = 'details_big'
			souceDiv.appendChild(descDiv)
			let descTitleDiv = document.createElement('div')
			descTitleDiv.className = 'title_big'
			descTitleDiv.textContent = '描述：'
			descDiv.appendChild(descTitleDiv)
			let infoDiv = document.createElement('div')
			infoDiv.className = 'info_big'
			infoDiv.innerHTML = '<p>大法师是好好干过过过过过过过过各行的哈的火锅店嘎哈的sad公司大好时光的阿斯钢大会时代光华个韩国短时搭嘎说过的话撒多好的感动行阿十多个安徽大的大说过的话阿萨德刚爱上低功耗对哈</p>'
			descDiv.appendChild(infoDiv)
			let typeDiv = document.createElement('div')
			typeDiv.className = 'type_big'
			typeDiv.innerHTML = Math.ceil(Math.random() * 10) > 5 ? '(类型：str)' : '(类型：int)'
			symbol.appendChild(typeDiv)
			field_info_plane = new CSS3DObject(souceDiv)
			group_field_info.add(field_info_plane)
			clearTimeout(timer)
		}, 2500)
	}

	// 添加轨道
	const addTrack = (radius, position) => {
		let trackGeometry = new THREE.RingGeometry(radius, radius + 6, 300)
		let trackMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
		let track = new THREE.Mesh(trackGeometry, trackMaterial)
		track.position.set(position.x, position.y, position.z)
		track.rotation.x = - Math.PI / 2
		return(track)
	}

	// 添加球体
	const addPlanet = (radius, position, texture, name) => {
		let planetGeometry = new THREE.SphereGeometry(radius, 50, 50)
		let planetMaterial = new THREE.MeshNormalMaterial()
		let planet = new THREE.Mesh(planetGeometry, planetMaterial)
		// planet.name = name
		planet.castShadow = true
		planet.position.set(position.x, position.y, position.z)
		return planet
	}

	// 初始化函数
	const init = () => {
		console.log('再次发生了init')
		let helper = new THREE.AxesHelper(3000)
		scene.add(helper)
		// const clock = new THREE.Clock()
		// 获取盒子的dom元素
		const container = document.getElementById('box')
		// 监听点击模型事件
		container.addEventListener('click', (event) => {
			event.preventDefault()
			console.log(event.target.getAttribute('id'))
			mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 -1
			mouse.y = (event.clientY / renderer.domElement.clientHeight) * 2 -1
			raycaster.setFromCamera(mouse, camera)
			let intersects = raycaster.intersectObjects(clickObjectArr)
			console.log(intersects)
			if (intersects.length > 0) {
				// 说明存在被点击的模型
				// 如果被点击的是中心圆球的话执行动画的切换
				if (intersects.some((item) => (item.object.name === 'centerSphereModel')) && hasSource) {
					// 调用数据源切换到数据元场景的函数
					sourceChangeField()
				} else if (intersects.some((item) => (item.object.name === 'centerSphereModel')) && !event.target.getAttribute('id')) {
					// 调用数据模型切换的动画
					switch (currentField) {
					case 'init': filedGeometryChangeFn('Cube')
						break
					case 'Cube': filedGeometryChangeFn('Annular')
						break
					case 'Annular': filedGeometryChangeFn('Sphere')
						break
					default: filedGeometryChangeFn('init')
					}
				} else if (intersects.some((item) => (item.object.name === 'centerSphereModel')) && event.target.getAttribute('id') && event.target.getAttribute('id').indexOf('plane') !== -1) {
					// 查看数据元详情
					fieldInfoFn()
				}
			} else {
				// 不存在被点击的模型
				// backSourceFn()
			}
		}, true)
		// 给场景添加星空盒子纹理
		new THREE.CubeTextureLoader()
			.setPath('assets/images/')
			.load([
				'bg1.jpg',
				'bg1.jpg',
				'bg1.jpg',
				'bg1.jpg',
				'bg1.jpg',
				'bg1.jpg' 		// 六张图片分别是朝前的（posz）、朝后的（negz）、朝上的（posy）、朝下的（negy）、朝右的（posx）和朝左的（negx）。
			], (texture) => {
				scene.background = texture // 添加背景到场景
			})

		// 相机所在位子
		camera.position.set(0, 600, 2400)

		// 相机作为orbitcontrol的参数，支持鼠标交互
		let orbitControls = new Orbitcontrols(camera)
		orbitControls.enableDamping = true

		// 设置环境光
		let light = new THREE.AmbientLight(0x000000, 1)
		scene.add(light)

		// 设置平行光
		let dirLight = new THREE.DirectionalLight(0xffffff, 1)
		dirLight.position.set(100, 1000, 1600)
		scene.add(dirLight)

		// let mixer

		// 中心的球体 ------- 数据源 -------- 以无数粒子方式展示效果
		const souce_show_handle = () => {

			// 在中心创建一个原型包裹这些立方体
			let sphere = new THREE.SphereGeometry(700, 65, 65)
			let sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x59ffc9, wireframe: true })
			let sphere_model = new THREE.Mesh(sphere, sphereMaterial)
			sphere_model.updateMatrix()
			clickObjectArr.push(sphere_model)
			sphere_model.name = 'centerSphereModel'
			console.log('球体也被再次添加？？？？')
			group_source_sphere.add(sphere_model)

			// 为这个球体几何加上label文案
			dynamicAddText(sphere_model, '我是数据源', 0, 800, 0)

			// 创建 长宽高都为40的立方体
			let cube = new THREE.BoxBufferGeometry(40, 40, 40)

			// 材质进行设置
			let cubeMaterial = new THREE.MeshPhongMaterial({ color: 0x34a0ff })

			// 循环渲染 400 个立方体盒子 为其添加上纹理
			for (let i = 0; i < 520; i++) {
				let cube_model = new THREE.Mesh(cube, cubeMaterial)
				cube_model.position.x = 400 * (2.0 * Math.random() - 1.0)
				cube_model.position.y = 400 * (2.0 * Math.random() - 1.0)
				cube_model.position.z = 400 * (2.0 * Math.random() - 1.0)
				cube_model.rotation.x = Math.random() * Math.PI
				cube_model.rotation.y = Math.random() * Math.PI
				cube_model.rotation.z = Math.random() * Math.PI
				cube_model.updateMatrix()
				group_source.add(cube_model)
				group_source_array.push(cube_model)
				// 球体中粒子的动画
				animateCubeTranslate({}, {}, TWEEN.Easing.Linear.None, TWEEN.Easing.Back.Out, cube_model)
			}

			// 动画的第二部 ---- 将这些方块变换成有文字的plan 进行组合
			// 无规则 ---- 进行初始化
			for (let i = 0; i < 300; i++) {
				let souceDiv = document.createElement('div')
				souceDiv.setAttribute('id', `plane${i}`)
				souceDiv.className = 'element'
				souceDiv.style.backgroundColor = 'rgba(6, 90, 245,' + (Math.random() * 0.5 + 0.45) + ')'
				let symbol = document.createElement('div')
				symbol.setAttribute('id', `planeSymbol${i}`)
				symbol.className = 'symbol'
				symbol.textContent = 'Field'
				souceDiv.appendChild(symbol)
				let details = document.createElement('div')
				details.setAttribute('id', `planeDetail${i}`)
				details.className = 'details'
				details.innerHTML = Math.ceil(Math.random() * 10) > 5 ? 'str' : 'int'
				souceDiv.appendChild(details)
				let object = new CSS3DObject(souceDiv)
				object.position.x = Math.random() * 800 - 400
				object.position.y = Math.random() * 800 - 400
				object.position.z = Math.random() * 800 - 400
				// group_source.add(object)
				init_field.push(object)
				clickObjectArr.push(group_source)
				object.name = 'soucePlane'
			}

			// 无规则的效果
			for (let i = 0; i < 300; i++) {
				let object = new THREE.Object3D()
				object.position.x = Math.random() * 800 - 400
				object.position.y = Math.random() * 800 - 400
				object.position.z = Math.random() * 800 - 400
				irregular_field.push(object)
			}

			// 矩形的效果
			for (let i = 0; i < 300; i++) {
				let object = new THREE.Object3D()
				object.position.x = ((i % 5) * 100) - 200
				object.position.y = (- (Math.floor(i / 5) % 5) * 100) + 200
				object.position.z = (Math.floor(i / 25)) * 45 - 247
				cube_field.push(object)
			}

			// 环形的效果
			for (let i = 0; i < 300; i++) {
				let theta = i * 0.175 + Math.PI
				let y = -(i * 3) + 450
				let object = new THREE.Object3D()
				object.position.setFromCylindricalCoords(400, theta, y)
				vector.x = object.position.x * 2
				vector.y = object.position.y * 0.2
				vector.z = object.position.z * 2
				object.lookAt(vector)
				annular_field.push(object)
			}

			// 圆形球体的效果
			for (let i = 0; i < 300; i++) {
				let phi = Math.acos(- 1 + (2 * i) / 300)
				let theta = Math.sqrt(300 * Math.PI) * phi
				let object = new THREE.Object3D()
				object.position.setFromSphericalCoords(560, phi, theta)
				vector.copy(object.position).multiplyScalar(2)
				object.lookAt(vector)
				sphere_field.push(object)
			}

		}

		// 添加围绕的球体
		let group_sphere_line = addTrack(1300, { x: 0, y: -400, z: 0 })
		group_rotate.add(group_sphere_line)
		apply_one = addPlanet(260, { x: 1300, y: -400, z: 0 })
		apply_two = addPlanet(260, { x: -1300, y: -400, z: 0 })
		apply_three = addPlanet(260, { x: 0, y: -400, z: 1300 })
		apply_four = addPlanet(260, { x: 0, y: -400, z: -1300 })
		group_rotate.add(apply_one)
		group_rotate.add(apply_two)
		group_rotate.add(apply_three)
		group_rotate.add(apply_four)
		console.log('我是的第607行，下一场是执行添加文字的函数')
		apply_one_text = dynamicAddText(apply_one, '我是应用1', 1300, 0, 0, 'small')
		apply_two_text = dynamicAddText(apply_two, '我是应用3', -1300, 0, 0, 'small')
		apply_three_text = dynamicAddText(apply_three, '我是应用4', 0, 0, 1300, 'small')
		apply_four_text = dynamicAddText(apply_four, '我是应用2', 0, 0, -1300, 'small')
		group_rotate.add(apply_one_text)
		group_rotate.add(apply_two_text)
		group_rotate.add(apply_three_text)
		group_rotate.add(apply_four_text)
		clickObjectArr.push(apply_one)
		clickObjectArr.push(apply_two)
		clickObjectArr.push(apply_three)
		clickObjectArr.push(apply_four)

		// 初次渲染时候的背景颜色
		renderer.setClearColor(0x000000)
		// 像素点
		renderer.setPixelRatio(window.devicePixelRatio)
		// 场景尺寸
		renderer.setSize(window.innerWidth, window.innerHeight)
		container.appendChild(renderer.domElement)
		// 2d渲染器
		labelRenderer.setSize(window.innerWidth, window.innerHeight)
		labelRenderer.domElement.style.position = 'absolute'
		labelRenderer.domElement.style.top = 20 + 'px'
		container.appendChild(labelRenderer.domElement)
		// 3d文字渲染器
		css3DRenderer.setSize(window.innerWidth, window.innerHeight)
		css3DRenderer.domElement.style.position = 'absolute'
		css3DRenderer.domElement.style.top = 20 + 'px'
		container.appendChild(css3DRenderer.domElement)
		const animate = () => {
			// 球体中粒子的动画
			// let time = clock.getDelta()
			// update 推进混合器时间并更新动画
			// if (mixer) {
			// 	mixer.update(time)
			// }
			// 必须写的
			requestAnimationFrame(animate)
			// 必须再此调用
			TWEEN.update()
			// 数据源展示中 圆球的转动效果
			group_source_sphere.rotation.y += 0.001
			if (!hasSource) {
				group_source.rotation.y += 0.003
			}
			group_rotate.rotation.y += 0.002
			// 设置相机镜头的朝向
			camera.lookAt(cameraTarget)
			// 渲染
			renderer.render(scene, camera)
			labelRenderer.render(scene, camera)
			css3DRenderer.render(scene, camera)
		}
		souce_show_handle()
		animate()
	}
	return (
		<div>
			<div id='box'>
				<div>
					<button onClick={clickFn}>click</button>
					<button onClick={resetFn}>reset</button>
					<button onClick={checkFn}>checkInfo</button>
					<button onClick={fieldInfoFn}>查看字段详情</button>
					<button onClick={showPlaneFn}>点击合并</button>
					<button onClick={() => (filedGeometryChangeFn('Irregular'))}>混乱</button>
					<button onClick={() => (filedGeometryChangeFn('Cube'))}>矩形</button>
					<button onClick={() => (filedGeometryChangeFn('Annular'))}>环形</button>
					<button onClick={() => (filedGeometryChangeFn('Sphere'))}>圆形</button>
					{showFont ? (
						<div>
							<div className='scene_desc'>这是该场景的描述</div>
							<div className='scene_data'>这是该场景展示的一些数据</div>
						</div>
					) : null}
				</div>
			</div>
		</div>
	)
}

export default FinalPage
