import React from 'react'
import Fuse from 'fuse.js'
import { getEntry } from 'astro:content';
import Text from './system/Text.jsx'
import MultiStyleText from './system/MultiStyleText.jsx'


const { data } = await getEntry('centres', 'centres')


let { centers: centersData } = data

centersData = centersData?.map(center => ({
    state: center?.state,
    districts: center?.districts?.map(district => ({
        district: district?.district,
        centres: district?.centres?.map(centre => ({
            centre: centre?.centre,
        }))
    }))
}))



import SearchIcon from '../icons/SearchIcon.svg'


const FindCentre = () => {
  const [centers, setCenters] = React.useState(centersData)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [currentState, setCurrentState] = React.useState('')
  const [currentDistrict, setCurrentDistrict] = React.useState('')

  const searchCentres = () => {
    const states = centers.map(center => center?.state).filter(state => state).map(item => ({ name: item, type: 'state' }))
    const districts = centers.map(center => center?.districts)
        .flat()
        .map(district => district?.district)
        .filter(district => district)
        .map(item => ({ name: item, type: 'district' }))
    const centres = centers.map(center => center?.districts).flat().map(district => district?.centres)
        .flat()
        .map(centre => centre?.centre)
        .filter(centre => centre)
        .map(item => ({ name: item, type: 'center' })) 

    const fuse = new Fuse([...states, ...districts, ...centres], {
        keys: ['name'],
        includeScore: true,
        threshold: 0.3
    })

    return fuse.search(searchQuery)

  }


  const searchResults = React.useMemo(() => {
    if (!searchQuery) return []
    return searchCentres()
  } , [searchQuery])

  const onPillClick = (type, name) => {
    console.log('onPill Click...', type, name)
    if (type === 'state') {
        setCurrentState(name)
    } else if (type === 'district') {
        setCurrentDistrict(name)
    } else if (type === 'center') {
        console.log('center', name)
    }
  }


  const isSearching = searchQuery !== ''

  const renderPill = (pills) => {
    return (
      <div className="w-full flex flex-row flex-wrap gap-4 items-center">
        {pills.map(pill => (
          <div onClick={() => onPillClick(pill.type, pill.label)} className="relative cursor-pointer border group hover:bg-[linear-gradient(180deg,_#FFF_0%,_#FFF3F3_100%)] hover:border-red-200 border-[rgba(113,101,101,0.21)] px-7 py-[18px] rounded-[10px] w-[180px] max-md:w-[47%] h-[90px] flex flex-row items-center justify-center">
            <Text type="base" className="font-[400] text-[#1c1c1c] group-hover:text-primary text-center">{pill.label}</Text>
            <div className="w-[24px] h-[24px] transition-all duration-500 opacity-0 right-[20%] pointer-events-none absolute group-hover:right-[4%] group-hover:opacity-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none">
                <path d="M4.00049 12.9265L20.0005 12.9265M20.0005 12.9265L14.0005 6.92648M20.0005 12.9265L14.0005 18.9265" stroke="#EE7F82" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderCentres = (centresLabel, stage) => {
    if (stage === 'search') {
      const groupByType = searchResults.reduce((acc, result) => {
        const { type, name } = result.item
        if (!acc[type]) {
          acc[type] = []
        }
        acc[type].push(name)
        return acc
      }, {})

      const groupKeys = Object.keys(groupByType)

      return (
        <div className="w-full" data-centres-container>
          {groupKeys.map(type => (
            <div class="py-2">
              <h3 class="my-2 text-2xl font-bold capitalize">{type}</h3>
              <div class="w-full flex flex-row flex-wrap gap-4 items-center">
                {renderPill(groupByType[type].map((name, index) => ({ label: name, type })))}
              </div>
            </div>
          ))}
        </div>
      )
    }
    
    return renderPill(centresLabel)
  }

  const isStateView = !currentState && !currentDistrict && !isSearching
  const isDistrictView = currentState && !currentDistrict && !isSearching
  const isCentreView = currentDistrict && !isSearching

  let districts = centers.find(center => center?.state === currentState)?.districts || []

  let thisDistrict = districts.find(district => district?.district === currentDistrict) || { centres: []}
  let ellyCenters = thisDistrict?.centres.map(centre => centre?.centre)

  const activeBreadCrumbClass = 'text-[#1c1c1c] underline'

  console.log('isStateView' && isStateView)
  
  return (
    <div className="flex flex-col gap-l items-center p-[60px] px-[90px] max-md:px-[20px] max-md:py-[40px]">
      <div data-appear id="findcentre">
          <Text type="h2" className="text-center">
                 Our
              <br />
              <MultiStyleText
                classes={["text-primary","text-primary","text-primary","text-primary","text-primary","text-primary","text-primary","text-primary","text-primary","text-primary","text-primary", "text-purple", "text-green-200", "text-orange-200", "text-purple", "text-primary", "text-green-200", "text-orange-200"]}
                text="Centers of Joy"
              ></MultiStyleText>
          </Text>
      </div>  
      
      <div data-appear={1} className="relative w-full max-w-[844px] gap-2 flex flex-row justify-end py-[6px]  pr-[10px] border-[1px] border-[#ddd] rounded-full" style={{
          boxShadow: '0px 1.366px 2.732px 0px rgba(0, 0, 0, 0.08), 0px 4.098px 10px 0px rgba(0, 0, 0, 0.10)'
      }}>
          <input
              className="w-full pl-[35px] max-md:pl-[20px] h-full absolute top-0 z-10 left-0 rounded-full text-[18px] max-md:text-[16px] font-bold placeholder:text-[#717171]/50 focus:outline-dotted focus:outline-primary focus:outline-[2px] focus:outline-offset-4"
              placeholder="Search by location"
              type="text"
              data-search-center
              value={searchQuery}
              onChange={() => setSearchQuery(event.target.value)}
          />
          <button className="w-[65px] h-[65px] max-md:w-[40px] max-md:h-[40px] bg-primary rounded-full flex-shrink-0 relative z-20 flex justify-center items-center">
              <div className="w-[33px] h-[33px] relative top-[3px]">
                  <img className="w-full h-full" src={SearchIcon.src} alt="Search Icon" />
              </div>
          </button>
      </div>
      <div data-appear={2} className="w-full  px-[30px] py-6 bg-white border rounded-[12px] border-black/10">
            {!isSearching && 
              <Text type="base">
                  <div className="font-[600] flex flex-row text-[#7b7b7b]">
                      <div 
                        onClick={() => {
                          setCurrentState('')
                          setCurrentDistrict('')
                        }}
                        className={"block cursor-pointer " + (isStateView ? activeBreadCrumbClass : '')}
                      >Locations</div>
                      {currentState && (
                          <>
                              <span className="mx-[10px]">{'>'}</span>
                              <div 
                                onClick={() => {
                                  setCurrentDistrict('')
                                }}
                                className={"cursor-pointer " + (isDistrictView ? activeBreadCrumbClass : '')}
                              >{currentState}</div>
                          </>
                      )}
                      {currentDistrict && (
                          <>
                              <span className="mx-[10px]">{'>'}</span>
                              <div className={"cursor-pointer " + (isCentreView ? activeBreadCrumbClass : '')}>{currentDistrict}</div>
                          </>
                      )}
                  </div>
              </Text>
            }
            {isSearching && 
              <Text type="base">
                  <div className="font-[600] flex flex-row text-[#7b7b7b]">
                      <div 
                        onClick={() => {
                          setCurrentState('')
                          setCurrentDistrict('')
                        }}
                        className={"block cursor-pointer " + (isStateView ? activeBreadCrumbClass : '')}
                      >Locations</div>
                 
                      <span className="mx-[10px]">{'>'}</span>
                      <div 
                        onClick={() => {
                          setCurrentDistrict('')
                        }}
                        className={"cursor-pointer " + (isDistrictView ? activeBreadCrumbClass : '')}
                      >{currentState}</div>

                  </div>
              </Text>
            }
          <div className="w-full h-[1px] bg-black/10 my-[10px]"></div>

          {isStateView && renderCentres(centers.map(center => ({label: center.state, type: 'state'})))}
          {isSearching && renderCentres(searchResults.map(result => ({ label: result.item?.name, type: result.item?.type })), 'search')}
          {isDistrictView && renderCentres(districts.map(district => ({ label: district.district, type: 'district' })))}
          {isCentreView && renderCentres(ellyCenters.map(centre => ({ label: centre, type: 'center' })))}
      </div>

  </div>
  )
}

export default FindCentre