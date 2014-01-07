//	---------------------------------------------------------------------------
//	jWebSocket - ClassPathUpdater (Community Edition, CE)
//	---------------------------------------------------------------------------
//	Copyright 2010-2013 Innotrade GmbH (jWebSocket.org)
//  Alexander Schulze, Germany (NRW)
//
//	Licensed under the Apache License, Version 2.0 (the "License");
//	you may not use this file except in compliance with the License.
//	You may obtain a copy of the License at
//
//	http://www.apache.org/licenses/LICENSE-2.0
//
//	Unless required by applicable law or agreed to in writing, software
//	distributed under the License is distributed on an "AS IS" BASIS,
//	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//	See the License for the specific language governing permissions and
//	limitations under the License.
//	---------------------------------------------------------------------------
package org.jwebsocket.dynamicsql;

import java.util.Iterator;
import java.util.List;
import java.util.Map;
import javax.sql.DataSource;
import javolution.util.FastList;
import org.apache.commons.beanutils.DynaBean;
import org.apache.ddlutils.Platform;
import org.apache.ddlutils.PlatformFactory;
import org.apache.ddlutils.model.Database;
import org.apache.ddlutils.model.Table;
import org.jwebsocket.dynamicsql.api.IDatabase;
import org.jwebsocket.dynamicsql.api.IQuery;
import org.jwebsocket.dynamicsql.api.ITable;

/**
 *
 * @author markos
 */
public class DynaDB implements IDatabase {

    private Platform mPlatform;
    private Database mDB;
    private Map<String, String> mOptions;

    public DynaDB(String aDatabaseName, DataSource aDataSource) {
        mPlatform = PlatformFactory.createNewPlatformInstance(aDataSource);
        mPlatform.setDelimitedIdentifierModeOn(true);
        mDB = mPlatform.readModelFromDatabase(aDatabaseName);
        mOptions = SupportUtils.getOptions(aDataSource);
    }

    @Override
    public String getName() {
        return mDB.getName();
    }

    @Override
    public void addTable(ITable aTable) {
        if (mDB.findTable(aTable.getName()) == null) {
            mDB.addTable(aTable.getTable());
        }
    }

    @Override
    public void dropTable(String aTableName) {
        if(existsTable(aTableName)) {
           mPlatform.dropTable(mDB, mDB.findTable(aTableName), true);
        }
    }

    @Override
    public void createTables(boolean aDropTablesFirst, boolean aContinueOnError) {
        System.out.println(mPlatform.getCreateTablesSql(mDB, aDropTablesFirst, aContinueOnError));
        mPlatform.createTables(mDB, aDropTablesFirst, aContinueOnError);
    }

    @Override
    public List<String> getTables() {
        List<String> lTables = new FastList<String>();
        for (Table lTable : mDB.getTables()) {
            lTables.add(lTable.getName());
        }
        return lTables;
    }

    @Override
    public Boolean existsTable(String aTableName) {
        if (mDB.findTable(aTableName) == null) {
            return false;
        }
        return true;
    }

    @Override
    public void insert(String aTableName, Map<String, Object> aItem) {
        mPlatform.insert(mDB, createDynaBean(aTableName, aItem));
    }

    @Override
    public void update(String aTableName, Map<String, Object> aItem) {
        mPlatform.update(mDB, createDynaBean(aTableName, aItem));
    }

    @Override
    public void delete(String aTableName, Map<String, Object> aItem) {
        mPlatform.delete(mDB, createDynaBean(aTableName, aItem));
    }
    
    private DynaBean createDynaBean(String aTableName, Map<String, Object> aItem) {
        DynaBean lDynaBean = mDB.createDynaBeanFor(aTableName, true);

        for (Map.Entry<String, Object> entry : aItem.entrySet()) {
            lDynaBean.set(entry.getKey(), entry.getValue());
        }
        return lDynaBean;
    }

    @Override
    public Map<String, String> getOptions() {
        return mOptions;
    }

    @Override
    public List<DynaBean> fetch(IQuery aQuery, Integer aOffset, Integer aLimit) {
        return mPlatform.fetch(mDB,aQuery.getSQL(), aOffset, aLimit);
    }

    @Override
    public Iterator execute(IQuery aQuery) {
        return mPlatform.query(mDB, aQuery.getSQL());
    }

    @Override
    public List<DynaBean> fetch(IQuery aQuery) {
        return mPlatform.fetch(mDB,aQuery.getSQL());
    }
}